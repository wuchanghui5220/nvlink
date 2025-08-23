const questions = [
{
    question: "Which of the following would you see in a North-South network?",
    options: ["A. Tightly-coupled processes", "B. Low jitter tolerance", "C. TCP", "D. Bursty network capacity"],
    answer: [2],
    type: "single"
},
{
    question: "What bandwidth can a customer get with a ConnectX-6 Dx EN?",
    options: ["A. 50 Gb/s", "B. 100 Gb/s", "C. 200 Gb/s", "D. 400 Gb/s"],
    answer: [2],
    type: "single"
},
{
    question: "What are the two key functions of a DPU?",
    options: [
        "A. It can be programmed to perform automatic data backup to 'cold', 'warm' and 'hot' sites.",
        "B. Run an organization main database server, to speed up IO.",
        "C. Offload, accelerate and isolate the infrastructure services from the host CPU.",
        "D. Free up the host CPU to run money-making applications.",
        "E. Run cluster job-scheduling and health monitoring tasks."
    ],
    answer: [2, 3],
    type: "multiple"
},
{
    question: "What type of port form factors can you expect to find in the ConnectX line of NICs?",
    options: ["A. QSFP28", "B. QSFP56", "C. OSFP", "D. All of the above"],
    answer: [3],
    type: "single"
},
{
    question: "Open Ethernet is:",
    options: [
        "A. An NVIDIA unique technology that allows separation of the switch hardware from the switch software.",
        "B. An open-source project, that allows different network operating system and software stacks to run on NVIDIA switch hardware.",
        "C. An open-source network operating system that can run on bare metal switches.",
        "D. An open installation environment that enables bare metal network switches to be installed with different network operating systems."
    ],
    answer: [1],
    type: "single"
},
{
    question: "Which of the following is true regarding What Just Happened (WJH), the NVIDIA telemetry solution?",
    options: [
        "A. A special software license is required in order to use WJH feature.",
        "B. WHJ is capable to monitor packets that were dropped due to hardware related issues only.",
        "C. WJH is supported on NVIDIA Cumulus Linux operating system only.",
        "D. Monitoring WJH is supported on CLI/WebUI as well as 3rd party platforms."
    ],
    answer: [3],
    type: "single"
},
{
    question: "What is the highest, single-port bandwidth rate of NDR InfiniBand switches and adapters?",
    options: ["A. 800 Gb/s", "B. 100 Gb/s", "C. 200 Gb/s", "D. 400 Gb/s"],
    answer: [3],
    type: "single"
},
{
    question: "Which of the following storage acceleration features is NOT offered by the BlueField DPU?",
    options: [
        "A. SHA-based de-duplication.",
        "B. Storage emulation.",
        "C. Encryption and decryption for data at-rest and in-flight.",
        "D. API access to Object Storage.",
        "E. Support for RDMA over IP."
    ],
    answer: [3],
    type: "single"
},
{
    question: "What benefit does InfiniBand provide over similar proprietary networks?",
    options: [
        "A. Extremely low latency",
        "B. Higher, more stable network speeds",
        "C. Advanced in-network computing",
        "D. Better cabling solutions"
    ],
    answer: [0, 2],
    type: "multiple"
},
{
    question: "Which NVIDIA InfiniBand feature would you recommend for optimizing collective operations offloading?",
    options: [
        "A. Fat tree topology",
        "B. RDMA (Remote Direct Memory Access)",
        "C. SHARP (Scalable Hierarchical Aggregation and Reduction Protocol)",
        "D. Adaptive Routing (AR)"
    ],
    answer: [2],
    type: "single"
},
{
    question: "What is the difference between a cable running at NDR200 and a cable running at 200 G/bs?",
    options: [
        "A. The bandwidth",
        "B. The number of lanes",
        "C. The Bit Error Rate (BER)",
        "D. All of the above"
    ],
    answer: [1],
    type: "single"
},
{
    question: "What is true about NVIDIA UFM?",
    options: [
        "A. An InfiniBand network management platform that oversees the network and allows easy management, smart monitoring and better troubleshooting.",
        "B. UFM is a network protocol and packet analyzer. It lets you see what's happening on your network at a microscopic level.",
        "C. UFM runs on a dedicated appliance only.",
        "D. UFM can manage fabrics of up to 4,000 nodes."
    ],
    answer: [0],
    type: "single"
},
{
    question: "How can RDMA achieve efficient and fast data movement between nodes at lower latency and CPU utilization?",
    options: [
        "A. RDMA boosts CPU performance by increasing the number of data copies between kernel space and user space, while handling network traffic.",
        "B. RDMA-capable network adapters include hardware offloading, bypassing the TCP/IP stack altogether.",
        "C. RDMA leverages the NVIDIA Magnum I/O software stack to enhance network performance."
    ],
    answer: [1],
    type: "single"
},
{
    question: "Which one of the following InfiniBand features enables dynamic and optimized traffic load balancing?",
    options: [
        "A. SHARP (Scalable Hierarchical Aggregation and Reduction Protocol)",
        "B. RDMA (Remote Direct Memory Access)",
        "C. HDR (High Data Rate)",
        "D. AR (Adaptive Routing)"
    ],
    answer: [3],
    type: "single"
},
{
    question: "Guaranteeing signal quality is the responsibility of which InfiniBand architecture layer?",
    options: ["A. Network layer", "B. Transport layer", "C. Link layer", "D. Physical layer"],
    answer: [3],
    type: "single"
},
{
    question: "Which Spectrum ASIC are the SN4000 switch series based on?",
    options: ["A. Spectrum-2", "B. Spectrum-3", "C. Spectrum-4", "D. Spectrum-LX"],
    answer: [1],
    type: "single"
},
{
    question: "What single-port bandwidth can a customer expect with an SN5600 switch?",
    options: ["A. 400 Gb/s", "B. 10 Gb/s", "C. 200 Gb/s", "D. 800 Gb/s"],
    answer: [3],
    type: "single"
},
{
    question: "Which of the following statements regarding RDMA programming is correct?",
    options: [
        "A. RDMA takes control over the host CPU, which significantly increases performance and ease manageability.",
        "B. RDMA can work on any OS and with any network adapter that is installed on the host.",
        "C. RDMA provides better latency and utilization of the host hardware compared to traditional socket API."
    ],
    answer: [2],
    type: "single"
},
{
    question: "Which of the below sentences are true about InfiniBand fabric scalability?",
    options: [
        "A. A single subnet can scale up to 4,000 nodes.",
        "B. In order to easily scale up, multiple InfiniBand subnets can be interconnected using InfiniBand routers.",
        "C. A single subnet can scale up to 48,000 nodes.",
        "D. A fat tree topology allows the best network scale out."
    ],
    answer: [1, 2],
    type: "multiple"
},
{
    question: "How is the InfiniBand messaging service different from the one provided by the traditional TCP/IP?",
    options: [
        "A. InfiniBand moves data from the operating system in one node, to the operating system in another node much faster, providing lower latency.",
        "B. InfiniBand provides hardware-based transport services implemented by the network adapters, also known as HCAs (Host Channel Adapters).",
        "C. InfiniBand eliminates the need to create end-to-end 'virtual channel' connecting two applications.",
        "D. InfiniBand eliminates the need for transport services allowing applications to communicate directly."
    ],
    answer: [1],
    type: "single"
},
{
    question: "What is the purpose of a router in the network?",
    options: [
        "A. To serve as the end point in the network, sending and receiving data.",
        "B. To provide the means by which the signals are transmitted from one networked device to another.",
        "C. To provide the connection points for the media.",
        "D. To interconnect networks and choose the best path between them."
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
    question: "What does the one-sided communication model in RDMA mean?",
    options: [
        "A. In RDMA, the Receiver is not necessarily involved in the data transfer operation. The data is being put directly where it needs to be.",
        "B. In RDMA, the sender sends information to the receiver. When the information is received the receiver decides where to store the received data.",
        "C. When a host sends data using RDMA, it uses the kernel to write data to the remote buffer."
    ],
    answer: [0],
    type: "single"
},
{
    question: "In a layer-2 data center design how can you achieve multipath support?",
    options: [
        "A. BGP with ECMP can be configured",
        "B. A layer-3 design cannot support multipath",
        "C. STP with ECMP can be configured",
        "D. An MSTP instance per VLANs group can be configured"
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
