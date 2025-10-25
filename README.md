# 🚀 Rocket Ground Support Equipment Control System

A comprehensive interactive GUI for Rocket Ground Support Equipment with real-time data monitoring, valve control, servo management, and load cell visualization.

## Features

### 🎛️ Control Panel
- **Mission Control**: Ready/Set/Launch sequence with status indicators
- **Emergency Stop**: Immediate system shutdown capability
- **Real-time Status**: Connection status, uptime, and system health

### 📊 Data Visualization
- **Live Charts**: Real-time graphing of pressure, temperature, flow rate, and voltage
- **Data Tables**: Recent data entries with timestamps
- **Load Cell Display**: Current, maximum, and minimum load readings

### 🔧 Hardware Control
- **Valve Control**: Main, Fuel, Oxidizer, and Purge valves with toggle switches
- **Servo Control**: Gimbal X/Y positioning and throttle control
- **Sensor Monitoring**: Pressure, temperature, flow rate, voltage, and load cell data

### 🔌 Communication
- **Arduino Integration**: Serial and WebSocket communication
- **Real-time Updates**: Live data streaming from hardware
- **Command Interface**: Send control commands to Arduino

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

### 3. Open the GUI

Navigate to `http://localhost:8080` in your web browser.

## Hardware Setup

### Arduino Requirements
- Arduino Uno/Mega or compatible
- Sensors: Pressure, Temperature, Flow, Voltage, Load Cell
- Actuators: Valves (4x), Servos (3x)
- Connections as defined in `arduino-sketch.ino`

### Pin Configuration
```cpp
// Sensor pins
const int PRESSURE_PIN = A0;
const int TEMPERATURE_PIN = A1;
const int FLOW_PIN = A2;
const int VOLTAGE_PIN = A3;
const int LOAD_CELL_PIN = A4;

// Valve control pins
const int MAIN_VALVE_PIN = 2;
const int FUEL_VALVE_PIN = 3;
const int OXIDIZER_VALVE_PIN = 4;
const int PURGE_VALVE_PIN = 5;

// Servo control pins
const int GIMBAL_X_PIN = 6;
const int GIMBAL_Y_PIN = 7;
const int THROTTLE_PIN = 8;
```

## File Structure

```
rocket-gse-control/
├── rocket-gse-gui.html      # Main GUI interface
├── arduino-interface.js      # Arduino communication layer
├── server.js                 # Node.js backend server
├── arduino-sketch.ino        # Arduino firmware
├── package.json              # Node.js dependencies
└── README.md                 # This file
```

## Usage

### GUI Controls

1. **Mission Sequence**:
   - Click "Ready" to initialize the system
   - Click "Set" to prepare for launch
   - Click "Launch" to begin mission sequence
   - Use "EMERGENCY STOP" for immediate shutdown

2. **Valve Control**:
   - Toggle switches to open/close valves
   - Visual indicators show current state
   - Commands sent to Arduino in real-time

3. **Servo Control**:
   - Use sliders to control gimbal positioning
   - Throttle control for engine management
   - Real-time position feedback

4. **Data Monitoring**:
   - Live charts show sensor data trends
   - Recent data table displays latest readings
   - Load cell monitoring with min/max tracking

### Arduino Communication

The system supports multiple communication methods:

1. **Serial Communication** (Primary):
   - Direct USB connection to Arduino
   - 9600 baud rate
   - Command format: `TYPE:PARAM:VALUE`

2. **WebSocket Communication** (Development):
   - For testing without hardware
   - Simulated data generation
   - Remote monitoring capability

### Command Protocol

#### Valve Commands
```
VALVE:MAIN:OPEN
VALVE:FUEL:CLOSE
VALVE:OXIDIZER:OPEN
VALVE:PURGE:CLOSE
```

#### Servo Commands
```
SERVO:GIMBALX:90
SERVO:GIMBALY:45
SERVO:THROTTLE:75
```

#### Emergency Commands
```
EMERGENCY:STOP
```

#### Status Commands
```
STATUS:READY
STATUS:SET
STATUS:LAUNCH
```

## Safety Features

- **Emergency Stop**: Immediate system shutdown
- **Safety Checks**: Pressure and temperature monitoring
- **Valve Interlocks**: Prevents unsafe valve combinations
- **Status Monitoring**: Real-time system health indicators

## Development

### Adding New Sensors

1. Update Arduino sketch with new sensor pin
2. Add sensor reading in `readSensors()` function
3. Update GUI to display new sensor data
4. Add chart visualization if needed

### Adding New Controls

1. Define new control in Arduino sketch
2. Add command parsing in `processCommand()`
3. Update GUI with new control interface
4. Implement communication in `arduino-interface.js`

### Customization

- **Styling**: Modify CSS in the HTML file
- **Layout**: Adjust grid structure for different screen sizes
- **Data Format**: Change sensor data format in Arduino sketch
- **Communication**: Modify protocol in `arduino-interface.js`

## Troubleshooting

### Connection Issues
- Check Arduino is connected and powered
- Verify correct COM port in server logs
- Ensure Arduino sketch is uploaded and running

### Data Not Updating
- Check serial communication in Arduino IDE
- Verify sensor connections
- Check for JavaScript errors in browser console

### GUI Not Loading
- Ensure Node.js server is running
- Check for port conflicts (default: 8080)
- Verify all dependencies are installed

## License

MIT License - See LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review Arduino serial monitor output
- Check browser developer console for errors
- Ensure all hardware connections are secure

---

**⚠️ Safety Warning**: This system controls potentially dangerous equipment. Always follow proper safety procedures and ensure all safety systems are in place before operation.