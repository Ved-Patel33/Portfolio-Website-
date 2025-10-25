// Node.js Server for Rocket Ground Support Equipment
// Handles WebSocket connections and Arduino communication

const WebSocket = require('ws');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const express = require('express');
const path = require('path');

class RocketGSEServer {
    constructor() {
        this.app = express();
        this.server = null;
        this.wss = null;
        this.serialPort = null;
        this.clients = new Set();
        this.arduinoData = {
            pressure: 0,
            temperature: 0,
            flowRate: 0,
            voltage: 0,
            loadCell: 0,
            valveStates: {},
            servoPositions: {}
        };
        this.setupExpress();
        this.setupWebSocket();
        this.setupSerial();
    }

    // Setup Express server for serving static files
    setupExpress() {
        this.app.use(express.static(path.join(__dirname)));
        
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'rocket-gse-gui.html'));
        });

        this.app.get('/api/status', (req, res) => {
            res.json({
                connected: this.serialPort ? this.serialPort.isOpen : false,
                clients: this.clients.size,
                data: this.arduinoData
            });
        });
    }

    // Setup WebSocket server
    setupWebSocket() {
        this.server = this.app.listen(8080, () => {
            console.log('🚀 Rocket GSE Server running on http://localhost:8080');
        });

        this.wss = new WebSocket.Server({ server: this.server });

        this.wss.on('connection', (ws) => {
            console.log('New client connected');
            this.clients.add(ws);

            // Send current data to new client
            ws.send(JSON.stringify({
                type: 'init',
                data: this.arduinoData
            }));

            ws.on('message', (message) => {
                try {
                    const command = JSON.parse(message);
                    this.handleClientCommand(command);
                } catch (error) {
                    console.error('Error parsing client message:', error);
                }
            });

            ws.on('close', () => {
                console.log('Client disconnected');
                this.clients.delete(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
        });
    }

    // Setup serial communication with Arduino
    async setupSerial() {
        try {
            // List available serial ports
            const ports = await SerialPort.list();
            console.log('Available serial ports:', ports);

            // Find Arduino port (usually contains 'Arduino' or 'USB' in description)
            const arduinoPort = ports.find(port => 
                port.manufacturer && (
                    port.manufacturer.includes('Arduino') ||
                    port.manufacturer.includes('USB') ||
                    port.productId
                )
            );

            if (!arduinoPort) {
                console.log('No Arduino found, starting simulation mode');
                this.startSimulationMode();
                return;
            }

            console.log('Connecting to Arduino on port:', arduinoPort.path);

            this.serialPort = new SerialPort(arduinoPort.path, {
                baudRate: 9600,
                autoOpen: false
            });

            const parser = this.serialPort.pipe(new Readline({ delimiter: '\n' }));

            this.serialPort.open((error) => {
                if (error) {
                    console.error('Error opening serial port:', error);
                    this.startSimulationMode();
                } else {
                    console.log('✅ Connected to Arduino');
                }
            });

            parser.on('data', (data) => {
                this.parseArduinoData(data);
            });

            this.serialPort.on('error', (error) => {
                console.error('Serial port error:', error);
                this.startSimulationMode();
            });

        } catch (error) {
            console.error('Error setting up serial communication:', error);
            this.startSimulationMode();
        }
    }

    // Parse data from Arduino
    parseArduinoData(data) {
        try {
            const line = data.trim();
            if (line.length === 0) return;

            // Expected format: "SENSOR:VALUE" or "STATUS:VALUE"
            const [type, value] = line.split(':');
            
            if (type && value !== undefined) {
                const sensorData = {
                    timestamp: new Date().toISOString(),
                    type: type.toLowerCase(),
                    value: parseFloat(value)
                };

                this.updateArduinoData(sensorData);
                this.broadcastToClients(sensorData);
            }
        } catch (error) {
            console.error('Error parsing Arduino data:', error);
        }
    }

    // Update internal Arduino data
    updateArduinoData(data) {
        switch (data.type) {
            case 'pressure':
                this.arduinoData.pressure = data.value;
                break;
            case 'temperature':
                this.arduinoData.temperature = data.value;
                break;
            case 'flow':
                this.arduinoData.flowRate = data.value;
                break;
            case 'voltage':
                this.arduinoData.voltage = data.value;
                break;
            case 'loadcell':
                this.arduinoData.loadCell = data.value;
                break;
            case 'valve':
                const [valveName, valveState] = data.value.split(':');
                this.arduinoData.valveStates[valveName] = valveState === 'open';
                break;
            case 'servo':
                const [servoName, servoPosition] = data.value.split(':');
                this.arduinoData.servoPositions[servoName] = parseFloat(servoPosition);
                break;
        }
    }

    // Broadcast data to all connected clients
    broadcastToClients(data) {
        const message = JSON.stringify(data);
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    // Handle commands from clients
    handleClientCommand(command) {
        console.log('Received command:', command);

        switch (command.type) {
            case 'valve':
                this.sendArduinoCommand(`VALVE:${command.valve}:${command.state.toUpperCase()}`);
                break;
            case 'servo':
                this.sendArduinoCommand(`SERVO:${command.servo}:${command.value}`);
                break;
            case 'emergency':
                this.sendArduinoCommand('EMERGENCY:STOP');
                break;
            case 'status':
                this.sendArduinoCommand(`STATUS:${command.status}`);
                break;
            case 'heartbeat':
                // Respond to heartbeat
                this.broadcastToClients({
                    type: 'heartbeat_response',
                    timestamp: Date.now()
                });
                break;
        }
    }

    // Send command to Arduino
    sendArduinoCommand(command) {
        if (this.serialPort && this.serialPort.isOpen) {
            this.serialPort.write(command + '\n', (error) => {
                if (error) {
                    console.error('Error sending command to Arduino:', error);
                } else {
                    console.log('Sent to Arduino:', command);
                }
            });
        } else {
            console.log('Arduino not connected, command not sent:', command);
        }
    }

    // Start simulation mode when no Arduino is connected
    startSimulationMode() {
        console.log('🎮 Starting simulation mode');
        
        setInterval(() => {
            const data = {
                timestamp: new Date().toISOString(),
                type: 'sensor_data',
                data: {
                    pressure: 50 + Math.random() * 50,
                    temperature: 20 + Math.random() * 30,
                    flowRate: 5 + Math.random() * 15,
                    voltage: 12 + Math.random() * 3,
                    loadCell: 100 + Math.random() * 900
                }
            };

            this.broadcastToClients(data);
        }, 1000);
    }

    // Graceful shutdown
    shutdown() {
        console.log('Shutting down server...');
        
        if (this.serialPort && this.serialPort.isOpen) {
            this.serialPort.close();
        }
        
        this.wss.close();
        this.server.close();
    }
}

// Create and start the server
const server = new RocketGSEServer();

// Handle graceful shutdown
process.on('SIGINT', () => {
    server.shutdown();
    process.exit(0);
});

process.on('SIGTERM', () => {
    server.shutdown();
    process.exit(0);
});

module.exports = RocketGSEServer;

