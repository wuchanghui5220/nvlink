const questions = [
{
    question: "网络如何为计算和存储解决方案增加价值？",
    options: ["A. 提供更好的应用性能", "B. 改善用户体验", "C. 优化现代存储系统", "D. 以上所有"],
    answer: [3],
    type: "multiple"
},
{
    question: "哪种网络解决方案最适合HPC和AI工作负载？",
    options: ["A. InfiniBand", "B. Ethernet", "C. Omniverse", "D. GeForce"],
    answer: [0],
    type: "single"
},
{
    question: "哪个网络组件提供了最广泛的安全解决方案？",
    options: ["A. InfiniBand连接器", "B. 网络交换机", "C. 网络接口卡", "D. NVIDIA BlueField DPUs"],
    answer: [3],
    type: "single"
},
{
    question: "Spectrum NetQ软件的作用是什么？",
    options: ["A. 遥测和验证", "B. 生产准备自动化", "C. 网络操作系统", "D. RoCE加速"],
    answer: [0],
    type: "single"
},
{
    question: "以下哪个软件是NVIDIA的旗舰NOS，并且预装在Spectrum交换机上？",
    options: ["A. EOS", "B. Cumulus", "C. DENT", "D. SONiC"],
    answer: [1],
    type: "single"
},
{
    question: "Spectrum交换机硬件实现了哪些性能增强？（选择所有适用项）",
    options: ["A. 最低延迟", "B. 公平带宽共享", "C. 微突发吸收", "D. 以上所有"],
    answer: [3],
    type: "multiple"
},
{
    question: "选择NVIDIA Air的正确用例（选择所有适用项）",
    options: ["A. 解决方案验证", "B. GPU加速", "C. 云VoIP增强", "D. 数据中心模拟"],
    answer: [0, 3],
    type: "multiple"
},
{
    question: "哪些类型的交换机是Spectrum以太网家族的一部分？（选择所有适用项）",
    options: ["A. 园区", "B. 边缘", "C. AI", "D. 路由器", "E. Leaf/Spine"],
    answer: [1, 2, 4],
    type: "multiple"
},
{
    question: "以下哪些目标市场适合Spectrum以太网平台产品？",
    options: ["A. 存储", "B. 云", "C. 政府", "D. 媒体/娱乐", "E. FSI", "F. 以上所有"],
    answer: [5],
    type: "multiple"
},
{
    question: "NVIDIA Spectrum以太网交换机属于哪个市场类别？（选择所有适用项）",
    options: ["A. 数据中心", "B. 园区", "C. 路由器"],
    answer: [0],
    type: "multiple"
},
{
    question: "客户可以通过NVIDIA Air进行Spectrum平台的无成本POC。",
    options: ["A. 真", "B. 假"],
    answer: [0],
    type: "single"
},
{
    question: "以下哪项有助于将 NVIDIA Spectrum 解决方案与其他供应商区分开来？（选择所有适用项）",
    options: ["A. 最高性能", "B. ASIC创新", "C. 电信功能", "D. 数据中心模拟", "E. 深度缓冲"],
    answer: [0, 1, 3],
    type: "multiple"
},
{
    question: "以下哪些NVIDIA解决方案可以利用Spectrum以太网连接？",
    options: ["A. DGX", "B. OVX", "C. EGX", "D. HGX", "E. 以上所有"],
    answer: [4],
    type: "multiple"
},
{
    question: "请选择关键的InfiniBand技术基础知识（选择所有适用项）。",
    options: ["A. 集中管理", "B. 软件定义网络", "C. InfiniBand是一种标准", "D. 可扩展架构", "E. 网络内计算"],
    answer: [0, 1, 2, 3, 4],
    type: "multiple"
},
{
    question: "NVIDIA的InfiniBand Quantum平台与NVIDIA的InfiniBand Quantum 2平台之间的端口速度差异是多少？",
    options: ["A. 400 Gb/s", "B. 200 Gb/s", "C. 100Gb/s", "D. 0 Gb/s"],
    answer: [1],
    type: "single"
},
{
    question: "NVIDIA Quantum-2 400G InfiniBand系统加速了任何规模的云原生超级计算。",
    options: ["A. 真", "B. 假"],
    answer: [0],
    type: "single"
},
{
    question: "选择最适合使用InfiniBand网络的所有应用程序（选择所有适用项）。",
    options: ["A. 可视化", "B. 训练AI", "C. 仿真", "D. ROBO", "E. 实时处理", "F. 数字孪生"],
    answer: [0, 1, 2, 4, 5],
    type: "multiple"
},
{
    question: "InfiniBand的主要目标市场是什么？",
    options: ["A. HPC/E级", "B. 超大规模/云", "C. AI/ML", "D. 嵌入式/企业/数据库", "E. 以上所有"],
    answer: [4],
    type: "multiple"
},
{
    question: "InfiniBand网络解决方案的顶级用例是什么？（选择所有适用项）",
    options: ["A. 云原生超级计算", "B. 训练AI", "C. 数据科学", "D. 科学研究", "E. 云网络加速", "F. 弹性、可组合存储"],
    answer: [0, 1, 2, 3, 4, 5],
    type: "multiple"
},
{
    question: "请选择InfiniBand网络的关键组件。",
    options: ["A. ConnectX适配器", "B. BlueField DPU", "C. Quantum交换机", "D. LinkX电缆", "E. Spectrum交换机", "F. Cumulus Linux"],
    answer: [0, 1, 2, 3],
    type: "multiple"
},
{
    question: "InfiniBand为HPC部署提供了比以太网更多的优势。",
    options: ["A. 真", "B. 假"],
    answer: [0],
    type: "single"
},
{
    question: "NVIDIA ________ InfiniBand平台是用于AI和科学计算工作负载的网络内计算、加速网络。",
    options: ["A. Quantum-2", "B. Quantum"],
    answer: [0],
    type: "single"
},
{
    question: "企业级客户通常选择哪种ConnectX SmartNIC？",
    options: ["A. ConnectX-6 LX", "B. ConnectX-6 DX", "C. ConnectX-7"],
    answer: [0],
    type: "single"
},
{
    question: "哪种ConnectX SmartNIC通常因其安全特性而被选择？",
    options: ["A. ConnectX-6 LX", "B. ConnectX-6 DX", "C. ConnectX-7"],
    answer: [1],
    type: "single"
},
{
    question: "NVIDIA BlueField-2是否包含ConnectX-6 DX网络接口？",
    options: ["A. 真", "B. 假"],
    answer: [0],
    type: "single"
},
{
    question: "NVIDIA DOCA是NVIDIA BlueField DPUs的软件框架？",
    options: ["A. 真", "B. 假"],
    answer: [0],
    type: "single"
},
{
    question: "NVIDIA DOCA为顾客提供了哪三个主要功能，以提高他们基础设施的性能？",
    options: ["A. 卸载、加速和隔离", "B. 密度、节能和性价比", "C. 卸载、隔离和安全性"],
    answer: [0],
    type: "single"
},
{
    question: "BlueField和DOCA的主要目标市场是什么？（选择所有适用项）",
    options: ["A. CSP & CRISP", "B. 企业云", "C. HPC", "D. 电信", "E. 数据科学"],
    answer: [0, 1, 2, 3, 4],
    type: "multiple"
},
{
    question: "NVIDIA BlueField的主要用例是什么？",
    options: ["A. 云计算", "B. 网络安全", "C. HPC & AI", "D. 电信 & 边缘", "E. 数据存储", "F. 媒体流"],
    answer: [0, 1, 2, 3, 4, 5],
    type: "multiple"
},
{
    question: "使用NVIDIA BlueField如何实现云规模效率？",
    options: ["A. 卸载基础设施工作负载", "B. 隔离基础设施", "C. 加速软件定义的网络、存储和安全", "D. 提供先进的零信任安全功能", "E. 以上所有"],
    answer: [0],
    type: "multiple"
},
{
    question: "当定位NVIDIA BlueField时，应该针对哪个关键角色？",
    options: ["A. 非C级IT决策者", "B. 网络架构师", "C. 首席数据官", "D. DevOps团队", "E. 首席技术官"],
    answer: [0],
    type: "single"
},
{
    question: "选择两个NVIDIA网络解决方案工具",
    options: ["A. NVIDIA NetQ", "B. NVIDIA Air", "C. Open NOS", "D. Cumulus Linux"],
    answer: [0, 1],
    type: "multiple"
},
{
    question: "NVIDIA Ethernet Spectrum交换机的主要目标行业是什么？（多选）",
    options: ["A. 云计算", "B. 边缘 & 5G 电信", "C. 机器学习 & AI", "D. 云游戏平台", "E. 内容分发网络"],
    answer: [0, 1, 2, 3, 4],
    type: "multiple"
},
{
    question: "成功定位NVIDIA Spectrum以太网解决方案的最佳方式是什么？",
    options: ["A. 为NVIDIA解决方案提供加速的以太网连接", "B. 连接数据中心服务器和存储的首选连接解决方案","C. 根据场景，选择以上任何一个或两个"],
    answer: [2],
    type: "single"
},
{
    question: "新的NVIDIA Spectrum-4 ASIC的速度范围是多少？",
    options: ["A. 1 GbE到200 GbE", "B. 1 GbE到400 GbE", "C. 10 GbE到800 GbE"],
    answer: [2],
    type: "single"
},
{
    question: "NVIDIA是唯一一家无论速度、拓扑和规模如何，都提供完整的端到端RoCE解决方案的供应商。",
    options: ["A. 真", "B. 假"],
    answer: [0],
    type: "single"
},
{
    question: "以下哪项最准确地描述了NVIDIA Air？",
    options: ["A. 是一个云模拟平台", "B. 托管在公共云上", "C. 能够创建完整的数据中心模拟", "D. 以上所有"],
    answer: [3],
    type: "single"
},
{
    question: "NVIDIA InfiniBand的目标市场是什么？",
    options: ["A. HPC/E级", "B. 超大规模/云", "C. ML & AI", "D. 嵌入式/企业/数据库"],
    answer: [0, 1, 2, 3],
    type: "multiple"
},
{
    question: "InfiniBand是最佳的和最终的软件定义网络（SDN）。",
    options: ["A. 真", "B. 假"],
    answer: [0],
    type: "single"
},
{
    question: "InfiniBand的网络内计算加速引擎的名称是什么？",
    options: ["A. SHARP", "B. DOCA", "C. ASAP^2", "D. Spectrum", "E. RDMA"],
    answer: [0],
    type: "single"
},
{
    question: "哪种软件允许简单部署和管理InfiniBand集群？",
    options: ["A. NVIDIA Cumulus", "B. DOCA", "C. NVIDIA UFM", "D. CUDA"],
    answer: [2],
    type: "single"
},
{
    question: "NVIDIA InfiniBand支持哪些网络拓扑？",
    options: ["A. Hypercube", "B. Torus", "C. HyperX", "D. Fat Tree", "E. DragonFly"],
    answer: [0, 1, 2, 3, 4],
    type: "multiple"
},
{
    question: "端到端NVIDIA InfiniBand系统目前提供400Gb/s [端口到端口]的速度，800Gb/s的连接将在何时可用？",
    options: ["A. 2022", "B. 2023", "C. 2024", "D. 2025"],
    answer: [1],
    type: "single"
},
{
    question: "除了提供数据中心连接之外，ConnectX和BlueField的主要用例是什么？",
    options: ["A. 加速网络", "B. 可组合存储", "C. 零信任安全", "D. 深度学习和AI", "E. 云管理", "F. 以上所有"],
    answer: [5],
    type: "multiple"
},
{
    question: "NVIDIA现在提供了一个融合加速卡，每张卡中结合了哪两种硬件技术？",
    options: ["A. BlueField-2", "B. DOCA", "C. NVIDIA RTX3080", "D. NVIDIA A30GPU / NVIDIA A100GPU"],
    answer: [0, 3],
    type: "multiple"
},
{
    question: "NVIDIA BlueField-3是下一代DPU，Ethernet或InfiniBand部署的连接速率是多少？",
    options: ["A. 100Gb/s", "B. 200Gb/s", "C. 400Gb/s", "D. 800Gb/s"],
    answer: [2],
    type: "single"
},
{
    question: "什么是NVIDIA DOCA？",
    options: ["A. NVIDIA合作伙伴生态系统", "B. DPU加速引擎", "C. 数据卸载加速器芯片", "D. BlueField DPUs的软件框架"],
    answer: [3],
    type: "single"
},
{
    question: "NVIDIA BlueField & DOCA可以通过利用零信任安全模型，在不牺牲性能的情况下为全面应用安全提供支持。",
    options: ["A. 真", "B. 假"],
    answer: [0],
    type: "single"
},
{
    question: "以下哪些陈述是正确的？选择所有适用的。",
    options: ["A. BlueField-2为25Gb/s和100Gb/s速度优化，提供了一系列网络、存储和安全加速", "B. BlueField-3为100Gb/s和400Gb/s速度增加了更多计算能力和可编程性", "C. DOCA提供向后兼容性，每一代BlueField都提供改进的性能", "D. DPU开发和PoC套件使客户和合作伙伴能够轻松尝试BlueField和DOCA", "E. 以上所有"],
    answer: [4],
    type: "multiple"
}

    // Add more questions here...
];

// 如果使用 ES6 模块
// export default questions;

// 如果不使用 ES6 模块
// 如果你的环境不支持 ES6 模块，请使用下面的方式：
if (typeof module !== 'undefined' && module.exports) {
    module.exports = questions;
}