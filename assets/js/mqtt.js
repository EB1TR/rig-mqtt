var hostname = "eb1tr.com";
var port = 9002;
var d = new Date();
var clientId = "V" + d.getTime();

var EB1TRrig = "eb1tr";

mqttClient = new Paho.Client(hostname, port, clientId);
mqttClient.onMessageArrived = MessageArrived;
var mqttConnected = false;

function Connect() {
    mqttClient.connect({
        onSuccess: Connected,
        onFailure: ConnectionFailed,
        keepAliveInterval: 30,
        reconnect: true
    });
}

function Disconnect() {
    console.log(new Date().toISOString() + " # MQTT Desconectando");
    mqttClient.disconnect({});
}

function Connected() {
    mqttClient.subscribe(EB1TRrig + "/#");
    console.log(new Date().toISOString() + " # MQTT Conectado");
    mqttConnected = true;
}

function ConnectionFailed(res) {
    console.log(new Date().toISOString() + " # MQTT Conexion fallida: " + res.errorMessage);
    mqttConnected = false;
}

function ParseMode(RigType, Data) {
    if (RigType == "k3") {
        if (Data == 2) {
            return "USB";
        } else if (Data == 1) {
            return "LSB";
        } else {
            return Data;
        }
    } else {
        return "NIL";
    }
}

function ParseQRG(RigType, Data) {
    if (RigType == "k3") {
        return (parseFloat(Data)/1000).toFixed(2)
    } else {
        return "NIL";
    }
}

function MessageArrived(message) {
    var Topic = message.topic;
    var TopicArray = Topic.split("/")
    var HTMLId = "#" + TopicArray[0] + "-" + TopicArray[2]
    var DataTS = "#" + TopicArray[0] + "-ts"
    var today = new Date();
    var now = today.toLocaleTimeString();
    var Data = message.payloadString;
    
    if (TopicArray[2] == "qrg") {
        $(HTMLId).text(ParseQRG(TopicArray[1], Data));
    } else if (TopicArray[2] == "mode") {
        $(HTMLId).text(ParseMode(TopicArray[1], Data));
    }
    $(DataTS).text(TopicArray[0].toUpperCase() + " | " + now);

}
Connect()