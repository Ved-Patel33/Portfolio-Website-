/*
 * Rocket Ground Support Equipment - Arduino Control System
 * 
 * This sketch handles:
 * - Sensor data reading (pressure, temperature, flow, voltage, load cell)
 * - Valve control (main, fuel, oxidizer, purge)
 * - Servo control (gimbal X/Y, throttle)
 * - Emergency stop functionality
 * - Serial communication with GUI
 */

// Pin definitions
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

// Status LED pins
const int STATUS_LED_PIN = 13;
const int ERROR_LED_PIN = 12;

// Servo objects
#include <Servo.h>
Servo gimbalX;
Servo gimbalY;
Servo throttle;

// System state
struct SystemState {
  float pressure = 0.0;
  float temperature = 0.0;
  float flowRate = 0.0;
  float voltage = 0.0;
  float loadCell = 0.0;
  
  bool mainValve = false;
  bool fuelValve = false;
  bool oxidizerValve = false;
  bool purgeValve = false;
  
  int gimbalXPos = 90;  // Center position
  int gimbalYPos = 90;  // Center position
  int throttlePos = 0;  // 0-100%
  
  bool emergencyStop = false;
  bool systemReady = false;
} systemState;

// Timing variables
unsigned long lastSensorRead = 0;
unsigned long lastStatusUpdate = 0;
const unsigned long SENSOR_READ_INTERVAL = 100;  // 100ms
const unsigned long STATUS_UPDATE_INTERVAL = 1000;  // 1s

// Calibration values (adjust based on your sensors)
const float PRESSURE_SCALE = 0.1;  // PSI per ADC unit
const float TEMPERATURE_SCALE = 0.1;  // Celsius per ADC unit
const float FLOW_SCALE = 0.1;  // L/min per ADC unit
const float VOLTAGE_SCALE = 0.01;  // Volts per ADC unit
const float LOAD_CELL_SCALE = 0.1;  // kg per ADC unit

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  Serial.println("Rocket GSE System Initializing...");
  
  // Initialize pins
  pinMode(MAIN_VALVE_PIN, OUTPUT);
  pinMode(FUEL_VALVE_PIN, OUTPUT);
  pinMode(OXIDIZER_VALVE_PIN, OUTPUT);
  pinMode(PURGE_VALVE_PIN, OUTPUT);
  pinMode(STATUS_LED_PIN, OUTPUT);
  pinMode(ERROR_LED_PIN, OUTPUT);
  
  // Initialize servos
  gimbalX.attach(GIMBAL_X_PIN);
  gimbalY.attach(GIMBAL_Y_PIN);
  throttle.attach(THROTTLE_PIN);
  
  // Set initial positions
  gimbalX.write(systemState.gimbalXPos);
  gimbalY.write(systemState.gimbalYPos);
  throttle.write(map(systemState.throttlePos, 0, 100, 0, 180));
  
  // Initialize all valves to closed
  digitalWrite(MAIN_VALVE_PIN, LOW);
  digitalWrite(FUEL_VALVE_PIN, LOW);
  digitalWrite(OXIDIZER_VALVE_PIN, LOW);
  digitalWrite(PURGE_VALVE_PIN, LOW);
  
  // System ready
  systemState.systemReady = true;
  digitalWrite(STATUS_LED_PIN, HIGH);
  
  Serial.println("Rocket GSE System Ready");
  Serial.println("Commands:");
  Serial.println("VALVE:<name>:<state> - Control valves (OPEN/CLOSE)");
  Serial.println("SERVO:<name>:<value> - Control servos");
  Serial.println("EMERGENCY:STOP - Emergency stop");
  Serial.println("STATUS:<status> - Set mission status");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Read sensors at regular intervals
  if (currentTime - lastSensorRead >= SENSOR_READ_INTERVAL) {
    readSensors();
    lastSensorRead = currentTime;
  }
  
  // Send status updates
  if (currentTime - lastStatusUpdate >= STATUS_UPDATE_INTERVAL) {
    sendStatusUpdate();
    lastStatusUpdate = currentTime;
  }
  
  // Check for incoming commands
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    processCommand(command);
  }
  
  // Emergency stop check
  if (systemState.emergencyStop) {
    emergencyStop();
  }
  
  // Update servo positions
  updateServos();
}

void readSensors() {
  // Read analog sensors
  systemState.pressure = analogRead(PRESSURE_PIN) * PRESSURE_SCALE;
  systemState.temperature = analogRead(TEMPERATURE_PIN) * TEMPERATURE_SCALE;
  systemState.flowRate = analogRead(FLOW_PIN) * FLOW_SCALE;
  systemState.voltage = analogRead(VOLTAGE_PIN) * VOLTAGE_SCALE;
  systemState.loadCell = analogRead(LOAD_CELL_PIN) * LOAD_CELL_SCALE;
  
  // Add some realistic noise and variation
  systemState.pressure += random(-5, 5) * 0.1;
  systemState.temperature += random(-2, 2) * 0.1;
  systemState.flowRate += random(-1, 1) * 0.1;
  systemState.voltage += random(-1, 1) * 0.01;
  systemState.loadCell += random(-10, 10) * 0.1;
  
  // Ensure values are within reasonable bounds
  systemState.pressure = constrain(systemState.pressure, 0, 200);
  systemState.temperature = constrain(systemState.temperature, -40, 150);
  systemState.flowRate = constrain(systemState.flowRate, 0, 50);
  systemState.voltage = constrain(systemState.voltage, 0, 20);
  systemState.loadCell = constrain(systemState.loadCell, 0, 2000);
}

void sendStatusUpdate() {
  // Send sensor data
  Serial.print("PRESSURE:");
  Serial.println(systemState.pressure);
  
  Serial.print("TEMPERATURE:");
  Serial.println(systemState.temperature);
  
  Serial.print("FLOW:");
  Serial.println(systemState.flowRate);
  
  Serial.print("VOLTAGE:");
  Serial.println(systemState.voltage);
  
  Serial.print("LOADCELL:");
  Serial.println(systemState.loadCell);
  
  // Send valve states
  Serial.print("VALVE:MAIN:");
  Serial.println(systemState.mainValve ? "OPEN" : "CLOSED");
  
  Serial.print("VALVE:FUEL:");
  Serial.println(systemState.fuelValve ? "OPEN" : "CLOSED");
  
  Serial.print("VALVE:OXIDIZER:");
  Serial.println(systemState.oxidizerValve ? "OPEN" : "CLOSED");
  
  Serial.print("VALVE:PURGE:");
  Serial.println(systemState.purgeValve ? "OPEN" : "CLOSED");
  
  // Send servo positions
  Serial.print("SERVO:GIMBALX:");
  Serial.println(systemState.gimbalXPos);
  
  Serial.print("SERVO:GIMBALY:");
  Serial.println(systemState.gimbalYPos);
  
  Serial.print("SERVO:THROTTLE:");
  Serial.println(systemState.throttlePos);
}

void processCommand(String command) {
  // Parse command format: "TYPE:PARAM:VALUE"
  int firstColon = command.indexOf(':');
  int secondColon = command.indexOf(':', firstColon + 1);
  
  if (firstColon == -1) return;
  
  String type = command.substring(0, firstColon);
  String param = "";
  String value = "";
  
  if (secondColon != -1) {
    param = command.substring(firstColon + 1, secondColon);
    value = command.substring(secondColon + 1);
  } else {
    param = command.substring(firstColon + 1);
  }
  
  type.toUpperCase();
  param.toUpperCase();
  value.toUpperCase();
  
  // Process different command types
  if (type == "VALVE") {
    controlValve(param, value);
  } else if (type == "SERVO") {
    controlServo(param, value);
  } else if (type == "EMERGENCY") {
    if (param == "STOP") {
      systemState.emergencyStop = true;
    }
  } else if (type == "STATUS") {
    setMissionStatus(param);
  }
}

void controlValve(String valveName, String state) {
  bool open = (state == "OPEN");
  int pin = -1;
  
  if (valveName == "MAIN") {
    pin = MAIN_VALVE_PIN;
    systemState.mainValve = open;
  } else if (valveName == "FUEL") {
    pin = FUEL_VALVE_PIN;
    systemState.fuelValve = open;
  } else if (valveName == "OXIDIZER") {
    pin = OXIDIZER_VALVE_PIN;
    systemState.oxidizerValve = open;
  } else if (valveName == "PURGE") {
    pin = PURGE_VALVE_PIN;
    systemState.purgeValve = open;
  }
  
  if (pin != -1) {
    digitalWrite(pin, open ? HIGH : LOW);
    Serial.print("Valve ");
    Serial.print(valveName);
    Serial.print(" ");
    Serial.println(open ? "opened" : "closed");
  }
}

void controlServo(String servoName, String value) {
  int position = value.toInt();
  
  if (servoName == "GIMBALX") {
    systemState.gimbalXPos = constrain(position, 0, 180);
    gimbalX.write(systemState.gimbalXPos);
  } else if (servoName == "GIMBALY") {
    systemState.gimbalYPos = constrain(position, 0, 180);
    gimbalY.write(systemState.gimbalYPos);
  } else if (servoName == "THROTTLE") {
    systemState.throttlePos = constrain(position, 0, 100);
    throttle.write(map(systemState.throttlePos, 0, 100, 0, 180));
  }
  
  Serial.print("Servo ");
  Serial.print(servoName);
  Serial.print(" set to ");
  Serial.println(position);
}

void setMissionStatus(String status) {
  Serial.print("Mission status: ");
  Serial.println(status);
  
  // Handle different mission statuses
  if (status == "READY") {
    systemState.systemReady = true;
    digitalWrite(STATUS_LED_PIN, HIGH);
  } else if (status == "LAUNCH") {
    // Launch sequence - could trigger specific actions
    Serial.println("Launch sequence initiated");
  } else if (status == "EMERGENCY") {
    systemState.emergencyStop = true;
  }
}

void emergencyStop() {
  // Close all valves
  digitalWrite(MAIN_VALVE_PIN, LOW);
  digitalWrite(FUEL_VALVE_PIN, LOW);
  digitalWrite(OXIDIZER_VALVE_PIN, LOW);
  digitalWrite(PURGE_VALVE_PIN, LOW);
  
  systemState.mainValve = false;
  systemState.fuelValve = false;
  systemState.oxidizerValve = false;
  systemState.purgeValve = false;
  
  // Reset servos to safe positions
  systemState.gimbalXPos = 90;
  systemState.gimbalYPos = 90;
  systemState.throttlePos = 0;
  
  // Update servo positions
  updateServos();
  
  // Flash error LED
  digitalWrite(ERROR_LED_PIN, HIGH);
  delay(500);
  digitalWrite(ERROR_LED_PIN, LOW);
  
  Serial.println("EMERGENCY STOP ACTIVATED");
}

void updateServos() {
  gimbalX.write(systemState.gimbalXPos);
  gimbalY.write(systemState.gimbalYPos);
  throttle.write(map(systemState.throttlePos, 0, 100, 0, 180));
}

// Safety check function
bool safetyCheck() {
  // Add safety checks here
  // For example: pressure limits, temperature limits, etc.
  
  if (systemState.pressure > 150) {
    Serial.println("WARNING: High pressure detected!");
    return false;
  }
  
  if (systemState.temperature > 100) {
    Serial.println("WARNING: High temperature detected!");
    return false;
  }
  
  return true;
}

