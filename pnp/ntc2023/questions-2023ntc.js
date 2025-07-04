const questions = [
{
    question: "边缘与其他常规小型数据中心有何不同？",
    options: ["A. 必须远程管理和保护", "B. 内部有特定的GPU", "C. 边缘云被2个InfiniBand节点包围", "D. 它在竞争中具有‘边缘’优势"],
    answer: [0],
    type: "single"
},
{
    question: "客户使用ConnectX-6 Dx EN可以获得多少带宽？",
    options: ["A. 50 Gb/s", "B. 100 Gb/s", "C. 200 Gb/s", "D. 400 Gb/s"],
    answer: [2],
    type: "single"
},
{
    question: "DPU的两个关键功能是什么？（选择两个）",
    options: ["A. 卸载、加速并隔离基础设施服务，使其与主机CPU分离", "B. 运行集群作业调度和健康监控任务", "C. 释放主机CPU以运行盈利应用程序", "D. 运行组织主数据库服务器，以加快IO", "E. 它可以被编程以执行自动数据备份到‘冷’、‘温’和‘热’站点"],
    answer: [0, 2],
    type: "multiple"
},
{
    question: "在ConnectX系列NIC中，您可以预期找到哪种端口形态？",
    options: ["A. QSFP28", "B. QSFP56", "C. OSFP", "D. 以上所有"],
    answer: [3],
    type: "single"
},
{
    question: "Open Ethernet是：",
    options: ["A. NVIDIA独特的技术，允许将交换机硬件与交换机软件分离", "B. 一个开源项目，允许在NVIDIA交换机硬件上运行不同的网络操作系统和软件堆栈", "C. 一个可以在裸机交换机上运行的开源网络操作系统", "D. 一个开放的安装环境，允许裸机网络交换机安装不同的网络操作系统"],
    answer: [1],
    type: "single"
},
{
    question: "关于NVIDIA遥测解决方案What Just Happened (WJH)，以下哪项是正确的？",
    options: ["A. 需要特殊软件许可证才能使用WJH功能", "B. WJH只能监控由于硬件相关问题而丢弃的数据包", "C. WJH仅支持NVIDIA Cumulus Linux操作系统", "D. 监控WJH支持CLI/WebUI以及第三方平台"],
    answer: [3],
    type: "single"
},
{
    question: "HDR InfiniBand交换机和适配器的最高单端口带宽速率是多少？",
    options: ["A. 50 Gb/s", "B. 100 Gb/s", "C. 200 Gb/s", "D. 400 Gb/s"],
    answer: [2],
    type: "single"
},
{
    question: "BlueField DPU不提供以下哪种存储加速功能？",
    options: ["A. 对静态和动态数据进行加密和解密", "B. 存储模拟", "C. 基于SHA的去重", "D. 对象存储的API访问", "E. 支持RDMA over IP"],
    answer: [3],
    type: "single"
},
{
    question: "InfiniBand相比于类似的专有网络提供了哪些优势？（选择2个答案）",
    options: ["A. 极低延迟", "B. 更高、更稳定的网络速度", "C. 高级网络内计算", "D. 更好的布线解决方案"],
    answer: [0, 2],
    type: "multiple"
},
{
    question: "为了优化集体操作卸载，你会推荐哪种NVIDIA InfiniBand特性？",
    options: ["A. 胖树拓扑", "B. RDMA (远程直接内存访问)", "C. SHARP (可扩展的层次聚合和简化协议)", "D. 自适应路由 (AR)"],
    answer: [2],
    type: "single"
},
{
    question: "NDR200电缆和200 G/bs电缆之间的区别是什么？",
    options: ["A. 带宽", "B. 车道数量", "C. 比特错误率 (BER)", "D. 以上所有"],
    answer: [1],
    type: "single"
},
{
    question: "关于NVIDIA UFM，以下哪项是正确的？",
    options: ["A. 一个InfiniBand网络管理平台，负责监督网络并允许轻松管理、智能监控和更好的故障排除", "B. UFM是一个网络协议和数据包分析器。它让你能够看到你的网络上正在发生的事情的微观层面", "C. UFM仅在专用设备上运行", "D. UFM可以管理多达4,000个节点的织物"],
    answer: [0],
    type: "single"
},
{
    question: "RDMA如何实现在降低延迟和CPU利用率的同时，高效快速地在节点之间移动数据？",
    options: ["A. RDMA利用NVIDIA Magnum I/O软件堆栈来增强网络性能", "B. RDMA通过增加内核空间和用户空间之间的数据副本数量来提升CPU性能，同时处理网络流量", "C. RDMA能力的网络适配器包括硬件卸载，完全绕过TCP/IP堆栈"],
    answer: [2],
    type: "single"
},
{
    question: "以下哪项InfiniBand特性支持动态和优化的流量负载均衡？",
    options: ["A. SHARP (可扩展的层次聚合和简化协议)", "B. RDMA (远程直接内存访问)", "C. HDR (高数据速率)", "D. AR (自适应路由)"],
    answer: [3],
    type: "single"
},
{
    question: "保证信号质量是哪个InfiniBand架构层的责任？",
    options: ["A. 网络层", "B. 传输层", "C. 链路层", "D. 物理层"],
    answer: [3],
    type: "single"
},
{
    question: "SN4000交换机系列基于哪个Spectrum ASIC？",
    options: ["A. Spectrum-2", "B. Spectrum-3", "C. Spectrum-4", "D. Spectrum-LX"],
    answer: [1],
    type: "single"
},
{
    question: "客户使用SN4600可以期待的单端口带宽是多少？",
    options: ["A. 400 Gb/s", "B. 50 Gb/s", "C. 100 Gb/s", "D. 200 Gb/s"],
    answer: [3],
    type: "single"
},
{
    question: "关于RDMA编程，以下哪项陈述是正确的？",
    options: ["A. RDMA可以在任何操作系统上工作，并且与安装在主机上的任何网络适配器一起使用", "B. RDMA与传统的套接字API相比，提供了更好的延迟和主机硬件利用率", "C. RDMA接管了主机CPU的控制权，显著提高了性能和管理的便捷性"],
    answer: [1],
    type: "single"
},
{
    question: "关于InfiniBand织物的可扩展性，以下哪两项是正确的？",
    options: ["A. 单个子网可以扩展到4,000个节点", "B. 为了轻松扩展，可以使用InfiniBand路由器将多个InfiniBand子网互连", "C. 单个子网可以扩展到48,000个节点", "D. 胖树拓扑允许最佳的网络扩展"],
    answer: [1, 2],
    type: "multiple"
},
{
    question: "InfiniBand消息服务与传统TCP/IP提供的有何不同？",
    options: ["A. InfiniBand将数据从一台节点的操作系统移动到另一台节点的操作系统更快，提供更低的延迟", "B. InfiniBand提供由网络适配器实现的基于硬件的传输服务，也称为HCAs (主机通道适配器)", "C. InfiniBand消除了创建连接两个应用程序的端到端“虚拟通道”的需求", "D. InfiniBand消除了传输服务的需求，允许应用程序直接通信"],
    answer: [1],
    type: "single"
},
{
    question: "网络中的路由器的目的是什么？",
    options: ["A. 作为网络的终点，发送和接收数据", "B. 提供信号从一个网络设备传输到另一个网络设备的途径", "C. 提供媒体的连接点", "D. 互连网络并选择它们之间的最佳路径"],
    answer: [3],
    type: "single"
},
{
    question: "HTTP和HTTPS之间的区别是什么？",
    options: ["A. HTTP使用TCP作为传输层协议，而HTTPS使用UDP", "B. HTTPS使用加密", "C. HTTP是应用层协议，而HTTPS提供传输服务", "D. HTTP在客户端运行，而HTTPS在服务器端运行"],
    answer: [1],
    type: "single"
},
{
    question: "RDMA使用单边通信模型。这意味着什么？",
    options: ["A. 当主机使用RDMA发送数据时，它使用内核将数据写入远程缓冲区", "B. 在RDMA中，接收方不一定参与数据传输操作。数据被直接放置在需要的地方", "C. 在RDMA中，发送方向接收方发送信息。当信息被接收时，接收方决定在哪里存储接收到的数据"],
    answer: [1],
    type: "single"
},

{
    question: "在二层数据中心设计中，如何实现多路径支持？",
    options: ["A. 可以配置BGP与ECMP", "B. 三层设计无法支持多路径", "C. 可以配置STP与ECMP", "D. 可以为每个VLAN组配置一个MSTP实例"],
    answer: [3],
    type: "single"
},
]

