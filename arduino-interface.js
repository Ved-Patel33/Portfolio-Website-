// Arduino Interface for Rocket Ground Support Equipment
// This file handles communication between the GUI and Arduino

class ArduinoInterface {
    constructor() {
        this.ws = null;
        this.serialPort = null;
        this.isConnected = false;
        this.dataCallbacks = [];
        this.commandQueue = [];
        this.reconnectInterval = null;
        this.heartbeatInterval = null;
    }

    // Initialize the Arduino interface
    async init() {
        try {
            // Try WebSocket connection first (for development/testing)
            await this.connectWebSocket();
        } catch (error) {
            console.log('WebSocket connection failed, trying Serial...');
            try {
                await this.connectSerial();
            } catch (serialError) {
                console.error('Both WebSocket and Serial connections failed:', serialError);
                this.startSimulationMode();
            }
        }
    }

    // Connect via WebSocket (for development/testing)
    async connectWebSocket() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket('ws://localhost:8080');
                
                this.ws.onopen = () => {
                    console.log('WebSocket connected to Arduino interface');
                    this.isConnected = true;
                    this.startHeartbeat();
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleIncomingData(data);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                this.ws.onclose = () => {
                    console.log('WebSocket connection closed');
                    this.isConnected = false;
                    this.scheduleReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    // Connect via Serial API (for production)
    async connectSerial() {
        if (!navigator.serial) {
            throw new Error('Serial API not supported');
        }

        try {
            const ports = await navigator.serial.getPorts();
            if (ports.length === 0) {
                throw new Error('No serial ports available');
            }

            this.serialPort = ports[0];
            await this.serialPort.open({ baudRate: 9600 });

            console.log('Serial connection established');
            this.isConnected = true;
            this.startSerialReader();
            this.startHeartbeat();
        } catch (error) {
            throw new Error(`Serial connection failed: ${error.message}`);
        }
    }

    // Start serial data reader
    startSerialReader() {
        const reader = this.serialPort.readable.getReader();
        
        const readLoop = async () => {
            try {
                while (this.isConnected) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const data = new TextDecoder().decode(value);
                    this.parseSerialData(data);
                }
            } catch (error) {
                console.error('Serial read error:', error);
                this.isConnected = false;
            } finally {
                reader.releaseLock();
            }
        };

        readLoop();
    }

    // Parse incoming serial data
    parseSerialData(data) {
        const lines = data.split('\n');
        
        lines.forEach(line => {
            line = line.trim();
            if (line.length === 0) return;

            try {
                // Expected format: "SENSOR:VALUE" or "STATUS:VALUE"
                const [type, value] = line.split(':');
                
                if (type && value !== undefined) {
                    const sensorData = {
                        timestamp: new Date().toISOString(),
                        type: type.toLowerCase(),
                        value: parseFloat(value)
                    };
                    
                    this.handleIncomingData(sensorData);
                }
            } catch (error) {
                console.error('Error parsing serial data:', error);
            }
        });
    }

    // Handle incoming data from Arduino
    handleIncomingData(data) {
        // Process different types of sensor data
        switch (data.type) {
            case 'pressure':
                this.emitData('pressure', data.value);
                break;
            case 'temperature':
                this.emitData('temperature', data.value);
                break;
            case 'flow':
                this.emitData('flowRate', data.value);
                break;
            case 'voltage':
                this.emitData('voltage', data.value);
                break;
            case 'loadcell':
                this.emitData('loadCell', data.value);
                break;
            case 'valve':
                this.emitData('valveStatus', data);
                break;
            case 'servo':
                this.emitData('servoStatus', data);
                break;
            default:
                console.log('Unknown data type:', data.type);
        }
    }

    // Emit data to registered callbacks
    emitData(type, value) {
        this.dataCallbacks.forEach(callback => {
            try {
                callback(type, value);
            } catch (error) {
                console.error('Error in data callback:', error);
            }
        });
    }

    // Register data callback
    onData(callback) {
        this.dataCallbacks.push(callback);
    }

    // Send command to Arduino
    sendCommand(command) {
        if (!this.isConnected) {
            console.warn('Arduino not connected, queuing command');
            this.commandQueue.push(command);
            return false;
        }

        const commandString = this.formatCommand(command);
        
        if (this.ws) {
            this.ws.send(JSON.stringify(command));
        } else if (this.serialPort) {
            this.sendSerialCommand(commandString);
        }

        return true;
    }

    // Format command for Arduino
    formatCommand(command) {
        switch (command.type) {
            case 'valve':
                return `VALVE:${command.valve}:${command.state.toUpperCase()}\n`;
            case 'servo':
                return `SERVO:${command.servo}:${command.value}\n`;
            case 'emergency':
                return `EMERGENCY:STOP\n`;
            case 'status':
                return `STATUS:${command.status}\n`;
            default:
                return `${command.type.toUpperCase()}:${command.value}\n`;
        }
    }

    // Send command via serial
    async sendSerialCommand(commandString) {
        try {
            const writer = this.serialPort.writable.getWriter();
            await writer.write(new TextEncoder().encode(commandString));
            writer.releaseLock();
        } catch (error) {
            console.error('Error sending serial command:', error);
        }
    }

    // Valve control commands
    openValve(valveName) {
        return this.sendCommand({
            type: 'valve',
            valve: valveName,
            state: 'open'
        });
    }

    closeValve(valveName) {
        return this.sendCommand({
            type: 'valve',
            valve: valveName,
            state: 'close'
        });
    }

    // Servo control commands
    setServoPosition(servoName, position) {
        return this.sendCommand({
            type: 'servo',
            servo: servoName,
            value: position
        });
    }

    // Emergency stop
    emergencyStop() {
        return this.sendCommand({
            type: 'emergency',
            action: 'stop'
        });
    }

    // Mission status commands
    setMissionStatus(status) {
        return this.sendCommand({
            type: 'status',
            status: status
        });
    }

    // Start heartbeat to maintain connection
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.sendCommand({
                    type: 'heartbeat',
                    timestamp: Date.now()
                });
            }
        }, 5000);
    }

    // Schedule reconnection attempt
    scheduleReconnect() {
        if (this.reconnectInterval) return;

        this.reconnectInterval = setInterval(async () => {
            try {
                await this.init();
                if (this.isConnected) {
                    clearInterval(this.reconnectInterval);
                    this.reconnectInterval = null;
                    this.processCommandQueue();
                }
            } catch (error) {
                console.log('Reconnection attempt failed, retrying...');
            }
        }, 5000);
    }

    // Process queued commands
    processCommandQueue() {
        while (this.commandQueue.length > 0) {
            const command = this.commandQueue.shift();
            this.sendCommand(command);
        }
    }

    // Start simulation mode when no real Arduino is connected
    startSimulationMode() {
        console.log('Starting simulation mode - no Arduino connected');
        this.isConnected = true;
        
        // Simulate sensor data
        setInterval(() => {
            const data = {
                pressure: 50 + Math.random() * 50,
                temperature: 20 + Math.random() * 30,
                flowRate: 5 + Math.random() * 15,
                voltage: 12 + Math.random() * 3,
                loadCell: 100 + Math.random() * 900
            };

            Object.entries(data).forEach(([type, value]) => {
                this.emitData(type, value);
            });
        }, 1000);
    }

    // Disconnect from Arduino
    disconnect() {
        this.isConnected = false;
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        if (this.serialPort) {
            this.serialPort.close();
            this.serialPort = null;
        }
        
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
        }
    }

    // Get connection status
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            type: this.ws ? 'websocket' : this.serialPort ? 'serial' : 'simulation',
            queuedCommands: this.commandQueue.length
        };
    }
}

// Export for use in the main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArduinoInterface;
} else {
    window.ArduinoInterface = ArduinoInterface;
}

