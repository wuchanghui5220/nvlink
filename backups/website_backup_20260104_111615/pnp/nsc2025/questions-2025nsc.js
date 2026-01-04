const questions = [
{
    question: "Which of the following are characteristics of the TCP/IP Model?",
    options: [
        "A. DoD standard",
        "B. Protocol-independent standard", 
        "C. Provided with a suite of protocols",
        "D. 4-Layer model",
        "E. Used on the Internet",
        "F. ISO standard",
        "G. 7-layer model",
        "H. Describes generic network architecture"
    ],
    answer: [0, 2, 3, 4],
    type: "multiple"
},
{
    question: "Which of the following are characteristics of the OSI Model?",
    options: [
        "A. ISO standard",
        "B. Describes generic network architecture",
        "C. 7-layer model",
        "D. DoD standard",
        "E. Used on the Internet",
        "F. Provided with a suite of protocols",
        "G. 4-layer model",
        "H. Protocol-independent standard"
    ],
    answer: [0, 1, 2, 7],
    type: "multiple"
},
{
    question: "What is data encapsulation?",
    options: [
        "A. The process of adding extra information at each layer of the OSI model while information flow from one host to another host.",
        "B. The process of breaking down the different functionalities of network communication into layers, in order to make communication easier.",
        "C. The process that specify how data is packetized, addressed, transmitted, routed, and received."
    ],
    answer: [1],
    type: "single"
},
{
    question: "A company has a teleconferencing system that uses VOIP technology. This system uses UDP as the transport. If UDP datagrams arrive at their destination out of sequence, what will happen?",
    options: [
        "A. UDP will send ICMP information request to the sending host.",
        "B. UDP will pass the information in the datagrams up to the next layer in the order they arrived.",
        "C. UDP will drop the datagrams.",
        "D. UDP will not acknowledge the datagrams but will wait for retransmission of the datagrams."
    ],
    answer: [1],
    type: "single"
},
{
    question: "What is one purpose of the TCP three-way handshake?",
    options: [
        "A. Sending echo requests from the source to the destination host to establish the presence of the destination.",
        "B. Determining the IP address of the destination host in preparation for data transfer.",
        "C. Requesting the destination to transfer a binary file to the source.",
        "D. Synchronizing between source and destination in preparation for data transfer."
    ],
    answer: [3],
    type: "single"
},
{
    question: "What is the difference between HTTP and HTTPS?",
    options: [
        "A. HTTP uses TCP as the transport layer protocol while HTTPS uses UDP",
        "B. HTTPS uses encryption",
        "C. HTTP is an application layer protocol while HTTPS provides the transport service",
        "D. HTTP runs on the client while HTTPS runs on the server"
    ],
    answer: [1],
    type: "single"
},
{
    question: "Which three statements characterize the transport layer protocols?",
    options: [
        "A. TCP uses windowing and sequencing to provide reliable transfer of data.",
        "B. TCP and UDP port numbers are used to identify application layer protocols.",
        "C. TCP uses port numbers to provide reliable transportation of IP packets.",
        "D. TCP is a connection-oriented protocol, UDP is a connectionless protocol.",
        "E. UDP uses windowing and acknowledgements for reliable transfer of data."
    ],
    answer: [0, 1, 3],
    type: "multiple"
},
{
    question: "What is the meaning of the output MTU 1500 Bytes?",
    options: [
        "A. The maximum number of bytes that can traverse this interface per second is 1500.",
        "B. The maximum frame size that can traverse this interface is 1500 bytes.",
        "C. The minimum packet size that can traverse this interface is 1500 bytes.",
        "D. The maximum packet size that can traverse this interface is 1500 bytes."
    ],
    answer: [3],
    type: "single"
},
{
    question: "What is the purpose of a switch in the network?",
    options: [
        "A. To choose the path over which data is sent to its destination",
        "B. To provide network attachment to the end systems and intelligent switching of the data within the local network",
        "C. To serve as the end point in the network, sending and receiving data",
        "D. To connect separate networks and filter the traffic over those networks so that the data is transmitted through the most efficient route"
    ],
    answer: [1],
    type: "single"
},
{
    question: "Why will a switch never learn a broadcast address?",
    options: [
        "A. Broadcast frames are never sent to switches.",
        "B. Broadcast addresses use an incorrect format for the switching table.",
        "C. A broadcast address will never be the source address of a frame.",
        "D. A broadcast frame is never forwarded by a switch."
    ],
    answer: [2],
    type: "single"
},
{
    question: "What is true about MAC addresses?",
    options: [
        "A. It consists of 48-bit address",
        "B. It consists of 32-bit address",
        "C. MAC address comes under the link layer of the OSI model",
        "D. MAC address comes under the network layer of the OSI model"
    ],
    answer: [0, 2],
    type: "multiple"
},
{
    question: "In a layer-3 data center design how can you achieve multipath support?",
    options: [
        "A. BGP with ECMP can be configured",
        "B. A layer-3 design cannot support multipath",
        "C. STP with ECMP can be configured",
        "D. An MSTP instance per VLAN group can be configured"
    ],
    answer: [0],
    type: "single"
},
{
    question: "BGP is an increasingly popular protocol for use in the data center thanks to the following properties:",
    options: [
        "A. Periodic updates that allow fast convergence",
        "B. Scalable and stable",
        "C. Multipath support",
        "D. BGP was specifically designed for leaf-spine topologies"
    ],
    answer: [1, 2],
    type: "multiple"
},
{
    question: "Which two of these are used to prevent loops in a layer 2 network?",
    options: [
        "A. STP",
        "B. BGP",
        "C. MLAG",
        "D. RoH",
        "E. ECMP"
    ],
    answer: [0, 2],
    type: "multiple"
},
{
    question: "What is the purpose of the Time To Live (TTL) field carried in an IP packet?",
    options: [
        "A. Do determine the number of routers the packet is allowed to traverse",
        "B. Do determine what is the trip time allowed for a packet till it gets to the destination node",
        "C. To avoid packets from endlessly circulating in a loop",
        "D. Do record the time it takes for a packet to get to the destination node"
    ],
    answer: [2],
    type: "single"
},
{
    question: "What bandwidth can a customer get with a ConnectX-7 EN?",
    options: ["A. 50GbE", "B. 100GbE", "C. 200GbE", "D. 400GbE"],
    answer: [3],
    type: "single"
},
{
    question: "What is Cumulus Linux?",
    options: [
        "A. An operating system for NVIDIA Open Ethernet Switches.",
        "B. A native linux distribution.",
        "C. A configuration wizard that enables initial settings to be configured.",
        "D. A widely-used Ethernet network protocol for provisioning."
    ],
    answer: [0, 1],
    type: "multiple"
},
{
    question: "Your customer is looking to upgrade his ethernet network to an Nvidia 200 Gbps ethernet network. He tells you that the new solution must support some legacy servers. Which interconnect solution can you offer that supports port connectivity?",
    options: [
        "A. QSFP-to-QSFP breakout cable",
        "B. QSFP-to-QSFP hybrid cable",
        "C. OSFP-to-QSFP cable",
        "D. All of the above"
    ],
    answer: [3],
    type: "single"
},
{
    question: "With the SN3800 Spectrum-2 switch, how many non-blocking 100GbE ports are supported in a 2-tier leaf/spine topology?",
    options: ["A. 64", "B. 512", "C. 1024", "D. 2048", "E. None of the above"],
    answer: [3],
    type: "single"
},
{
    question: "Nvidia's breakout cable solutions enable users to split a single port into two or four sub-ports. What are the advantages of such a solution?",
    options: [
        "A. Reduced number of switches and rack units",
        "B. Better bandwidth utilization",
        "C. Reduced bit error ratio (BER)",
        "D. Higher bandwidth"
    ],
    answer: [0, 1],
    type: "multiple"
},
{
    question: "What bandwidth can a customer get with an SN4600?",
    options: ["A. 400GbE", "B. 50GbE", "C. 200GbE", "D. 100GbE"],
    answer: [2],
    type: "single"
},
{
    question: "What is Open Ethernet?",
    options: [
        "A. An open source network operating system that can run on bare metal switches",
        "B. An open source project, which allows different network operating system and software stacks to run on switch hardware",
        "C. An open installation environment that enables bare metal network switches to be installed with different network operating systems",
        "D. A unique technology that allows for the separation of the switch hardware from the switch software"
    ],
    answer: [1],
    type: "single"
},
{
    question: "What type of security enhancements are the ConnectX models equipped with?",
    options: [
        "A. None, the user must load their own security methods",
        "B. Onboard Encryption / Decryption, Root-of-Trust key and Stateful Firewall Acceleration",
        "C. Users can purchase security enhancement upgraded cards with an additional monthly subscription that offer an advance ISECP-5 encryption, among other features"
    ],
    answer: [1],
    type: "single"
},
{
    question: "What Just Happened (WJH) is a telemetry solution that provides the ability to retain the last dropped packets with the actual drop reason. Which of the following sentences regarding WJH are true?",
    options: [
        "A. A special software license is required in order to use WJH feature.",
        "B. Monitoring WJH is supported through CLI commands, the WebUI and 3rd party platforms.",
        "C. WJH generates a .PCAP file with the dropped packets and their metadata.",
        "D. WJH can monitor packets that were dropped due to hardware related issues only."
    ],
    answer: [1, 2],
    type: "multiple"
},
{
    question: "What are the two key functions of a DPU?",
    options: [
        "A. Run an organization main database server, to speed up IO.",
        "B. Offload, accelerate and isolate the infrastructure services from the host CPU.",
        "C. Free up the host CPU to run money-making applications.",
        "D. Run cluster job-scheduling and health monitoring tasks.",
        "E. It can be programmed to perform automatic data backup to 'cold', 'warm' and 'hot' sites."
    ],
    answer: [1, 2],
    type: "multiple"
},
{
    question: "Which of the following storage acceleration features is NOT offered by the BlueField DPU?",
    options: [
        "A. Storage emulation.",
        "B. Encryption and decryption for data at-rest and in-flight.",
        "C. SHA-based de-duplication.",
        "D. API access to Object Storage.",
        "E. Support for RDMA over IP."
    ],
    answer: [3],
    type: "single"
},
{
    question: "On which markets is InfiniBand widely adopted?",
    options: [
        "A. HPC",
        "B. Artificial Intelligence / Deep Learning",
        "C. Data-Science",
        "D. All of the Above"
    ],
    answer: [3],
    type: "single"
},
{
    question: "What is the top data rate available on NDR InfiniBand Switches and Adapters?",
    options: ["A. 400Gb/s", "B. 200Gb/s", "C. 50Gb/s", "D. 25Gb"],
    answer: [0],
    type: "single"
},
{
    question: "What is true about NVIDIA Self-Healing Network feature?",
    options: [
        "A. It supports link fault recovery of 1 msec.",
        "B. It supports storage offloading to prevent data loss across the network.",
        "C. It supports link fault recovery of 5 sec.",
        "D. It supports link fault recovery of 5000 msec.",
        "E. It is a hardware-based capability of NVIDIA switches."
    ],
    answer: [0, 4],
    type: "multiple"
},
{
    question: "What does 'Kernel Bypass' mean?",
    options: [
        "A. A routing technique that goes around the Kernel Version in order to achieve minimal latency between queries",
        "B. When the data is passed from the user application to the hardware it doesn't have to pass through the operating system",
        "C. Bypassing the hardware so it doesn't slow down the connection line",
        "D. None of the above"
    ],
    answer: [1],
    type: "single"
},
{
    question: "Despite the fact that the SM (Subnet Manager) server crashed, the fabric remained completely intact. This is related to the fact that:",
    options: [
        "A. There is a standby SM",
        "B. The SM supports only one default partition",
        "C. No switch crashed",
        "D. The SM has a bonding ports connection"
    ],
    answer: [0],
    type: "single"
},
{
    question: "What is UFM?",
    options: [
        "A. An InfiniBand network management platform that oversees the network and allows easy management, smart monitoring and better troubleshooting",
        "B. A widely-used Ethernet network protocol and packet analyzer. It lets you see what's happening on your network at a microscopic level",
        "C. A CLI command that can be used to set different network elements as the Subnet Manager.",
        "D. All of the above."
    ],
    answer: [0],
    type: "single"
},
{
    question: "True or False: InfiniBand fabric is an isolated fabric that cannot be connected to other Ethernet networks.",
    options: ["A. True", "B. False"],
    answer: [1],
    type: "single"
},
{
    question: "Which of the following are differences between DACs and AOCs?",
    options: [
        "A. Range",
        "B. LSZH Shielding",
        "C. Bit Error Ratio (BER)",
        "D. Weight",
        "E. Power Consumption"
    ],
    answer: [0, 3, 4],
    type: "multiple"
},
{
    question: "How is the InfiniBand messaging service different from the one provided by the traditional TCP/IP?",
    options: [
        "A. InfiniBand eliminates the need for transport services allowing applications to communicate directly.",
        "B. InfiniBand provides hardware-based transport services implemented by the network adapters, also known as HCAs (Host Channel Adapters).",
        "C. InfiniBand eliminates the need to create end-to-end \"virtual channel\" connecting two applications.",
        "D. InfiniBand moves data from the operating system in one node, to the operating system in another node much faster, providing lower latency."
    ],
    answer: [1],
    type: "single"
},
{
    question: "The goal of credit-based flow control mechanism is to:",
    options: [
        "A. Enable high-priority service to specific applications",
        "B. Limit the number of switches in the loop",
        "C. Avoid credit loops",
        "D. Ensure that packets are not lost within the fabric even in the presence of congestion"
    ],
    answer: [3],
    type: "single"
}
];

// 如果使用 ES6 模块
// export default questions;

// 如果不使用 ES6 模块
// 如果你的环境不支持 ES6 模块，请使用下面的方式：
if (typeof module !== 'undefined' && module.exports) {
    module.exports = questions;
}
