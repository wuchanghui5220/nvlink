

### **培训主题：GPU服务器集群性能测试及调优技术**


### **第三天：GPU服务器基础测试**

#### **1. GPU服务器硬件介绍**


*   **核心组件概览**
    *   **GPU (图形处理器):** 核心计算单元，负责并行处理密集型计算任务。现代数据中心GPU（如NVIDIA A100, H100）区别于消费级显卡，拥有更高的双精度性能、更大的显存（VRAM）和专为AI、HPC设计的架构。
    *   **CPU (中央处理器):** 负责处理操作系统、任务调度、数据预处理和串行计算部分，是GPU的“指挥官”。为避免数据传输瓶颈，GPU服务器通常配置高性能、多核心的CPU（如 Intel Xeon 或 AMD EPYC 系列）。 建议每个GPU至少对应6个物理CPU核心。
    *   **内存 (RAM):** 系统内存，用于存放待处理的数据集和模型的中间数据。深度学习任务通常需要大量内存，建议至少是所有GPU显存总和的两倍，例如，一个配备8张80GB显存GPU的服务器，建议配置 1.2TB 以上的系统内存。
    *   **存储 (Storage):** 用于存放操作系统、训练数据集和模型。为满足大规模数据集的快速读取需求，强烈推荐使用高速NVMe SSD作为主存储。 对于超大规模数据集，通常会搭配Lustre, BeeGFS等并行文件系统。
    *   **网络 (Networking):** 多节点GPU集群的性能瓶颈往往在网络上。高速、低延迟的网络至关重要，通常使用InfiniBand或至少200Gbps的高速以太网。

*   **关键技术：GPU互联**
    *   **PCIe (Peripheral Component Interconnect Express):** GPU与CPU之间以及GPU与GPU之间的基础通信总线。每个GPU通常需要一个专用的PCIe x16插槽以保证最大带宽。 现代服务器普遍采用PCIe Gen4或Gen5技术，其带宽相比前代翻倍，能有效降低数据传输延迟。
    *   **NVLink & NVSwitch:** 这是NVIDIA的专有技术，用于GPU之间的高速直接互联，其带宽远超PCIe。
        *   **NVLink:** 提供点对点的GPU直接通信，类似于专为GPU打造的高速公路。 第四代NVLink (H100 GPU) 带宽可达900 GB/s。
        *   **NVSwitch:** 类似于一个交换机，可将多个NVLink连接起来，实现全连接的、非阻塞式的GPU间通信，这对于大规模多GPU系统（如NVIDIA DGX平台）至关重要。

    *   **运维人员需要关注：** 检查服务器拓扑结构，确保GPU均匀分布在不同的CPU Socket和PCIe Root Port下，避免资源争抢。

#### **2. GPU服务器BIOS与BMC配置**

正确的BIOS和BMC配置是发挥GPU服务器性能和实现高效管理的基础。

*   **BIOS (基本输入输出系统) 配置**
    *   **Above 4G Decoding / Large BAR Support:** **必须启用**。该选项允许操作系统访问大于4GB的PCIe设备地址空间，对于拥有大显存的GPU至关重要。
    *   **PCIe Link Speed:** 设置为支持的最高版本（如 `Gen4` 或 `Gen5`），以确保最大带宽。
    *   **CPU Power Management:** 对于需要极致性能的训练任务，可将电源模式设置为“Maximum Performance”，以确保CPU始终运行在最高频率。
    *   **Virtualization Technology (VT-x/AMD-V):** 如果需要在GPU服务器上部署虚拟机，需确保该选项已启用。
    *   **SR-IOV (Single Root I/O Virtualization):** 如果需要将一块物理GPU虚拟化给多个虚拟机使用，需检查并开启此项。

*   **BMC (基板管理控制器) 配置**
    *   **远程管理:** 与传统服务器类似，通过IPMI (Intelligent Platform Management Interface) 或 Redfish API 进行远程电源控制、监控传感器（温度、功耗、风扇转速）和日志访问。
    *   **运维要点:** GPU是高功耗设备，需要重点监控其温度和功耗。通过BMC可以设置告警阈值，防止因过热导致降频或损坏。
    *   **常用IPMI命令:**
        ```bash
        # 通过IPMI检查服务器健康状态
        ipmitool -I lanplus -H <BMC_IP> -U <username> -P <password> sensor list

        # 远程开机/关机/重启
        ipmitool -I lanplus -H <BMC_IP> -U <username> -P <password> power on
        ipmitool -I lanplus -H <BMC_IP> -U <username> -P <password> power off
        ipmitool -I lanplus -H <BMC_IP> -U <username> -P <password> power reset
        ```

#### **3. 操作系统与基础配置**

选择和配置合适的操作系统是后续所有工作的前提。

*   **操作系统选择**
    *   **Ubuntu:** 最受欢迎的选择，拥有庞大的社区支持，与NVIDIA驱动、CUDA及主流AI框架（TensorFlow, PyTorch）兼容性极佳。
    *   **RHEL/Rocky Linux:** 在企业环境中因其稳定性和长期支持而备受青睐。NVIDIA同样提供官方支持。

*   **基础配置与命令**
    *   **系统更新:** 保持系统最新是安全和稳定的基础。
        ```bash
        # For Ubuntu/Debian
        sudo apt update && sudo apt full-upgrade -y
        ```
    *   **安装编译工具:** 安装驱动和CUDA Toolkit需要`gcc`等编译工具。
        ```bash
        # For Ubuntu/Debian
        sudo apt install build-essential gcc -y
        ```
        *   **验证:** `gcc --version`
    *   **关闭图形化界面:** 对于专用的计算服务器，图形化界面会占用宝贵的GPU资源。
        ```bash
        # 设置默认启动模式为多用户文本模式
        sudo systemctl set-default multi-user.target
        # 重启后将进入文本界面
        sudo reboot
        ```

#### **4. 驱动安装与配置**

这是整个配置过程中最关键、也最容易出错的环节。

*   **步骤一：安装NVIDIA驱动**
    *   **方法1：使用发行版包管理器（推荐）**
        ```bash
        # For Ubuntu
        # 1. 检测硬件并推荐驱动版本
        sudo ubuntu-drivers devices

        # 2. 自动安装推荐的服务器版本驱动
        sudo ubuntu-drivers install --gpgpu

        # 或者，手动安装指定版本的服务器驱动（例如535版本）
        sudo apt install nvidia-driver-535-server
        ```
       
    *   **方法2：使用官方 .run 安装包（更灵活但管理稍复杂）**
        1.  从 [NVIDIA官网](https://www.nvidia.com/Download/index.aspx) 下载对应GPU型号和操作系统的驱动。
        2.  给安装包添加执行权限：`chmod +x NVIDIA-Linux-x86_64-xxx.xx.run`
        3.  执行安装：`sudo ./NVIDIA-Linux-x86_64-xxx.xx.run`
    *   **验证驱动安装:**
        ```bash
        nvidia-smi
        ```
        如果成功，该命令会返回一个包含所有GPU信息的列表，包括驱动版本、CUDA版本和每张卡的实时状态（温度、功耗、显存使用率等）。

*   **步骤二：安装CUDA Toolkit**
    *   **简介:** CUDA是NVIDIA推出的并行计算平台和编程模型，是运行AI/HPC应用所必需的。
    *   **安装方法:** 推荐使用NVIDIA官方提供的包管理器方式。
        1.  访问 [NVIDIA CUDA Toolkit官网](https://developer.nvidia.com/cuda-downloads) 选择你的系统和版本，官网会提供详细的安装命令。
        2.  通常命令会类似如下 (以Ubuntu为例):
            ```bash
            # 添加NVIDIA的仓库和密钥，并安装
            # （请务必从官网获取最新的命令）
            wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.1-1_all.deb
            sudo dpkg -i cuda-keyring_1.1-1_all.deb
            sudo apt-get update
            sudo apt-get -y install cuda
            ```
    *   **配置环境变量:**
        ```bash
        # 将以下内容添加到 ~/.bashrc 文件末尾
        export PATH=/usr/local/cuda/bin${PATH:+:${PATH}}
        export LD_LIBRARY_PATH=/usr/local/cuda/lib64${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}

        # 使配置立即生效
        source ~/.bashrc
        ```
       
    *   **验证CUDA Toolkit安装:**
        ```bash
        # 检查编译器版本
        nvcc --version

        # 编译并运行官方示例来验证
        cd /usr/local/cuda/samples/1_Utilities/deviceQuery
        sudo make
        ./deviceQuery
        ```
        如果最后显示 `Result = PASS`，则表示CUDA已成功安装并能与GPU通信。

*   **步骤三：安装NVIDIA Container Toolkit**
    *   **简介:** 如果要在Docker容器中使用GPU，则必须安装此工具包。
    *   **安装与配置:**
        ```bash
        # 添加NVIDIA容器工具包的仓库和密钥
        curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
          && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | \
            sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
            sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

        sudo apt-get update
        sudo apt-get install -y nvidia-container-toolkit

        # 配置Docker以使用NVIDIA运行时
        sudo nvidia-ctk runtime configure --runtime=docker
        sudo systemctl restart docker
        ```
       
    *   **验证容器工具包:**
        ```bash
        docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi
        ```
        如果在容器内部成功执行了 `nvidia-smi` 命令并显示了GPU信息，则表示配置成功。

#### **5. 高级系统配置**

这些配置可以进一步压榨系统性能，对于HPC和大规模训练尤为重要。

*   **GPU持久模式 (Persistence Mode)**
    *   **目的:** 驱动默认在没有程序使用GPU时会卸载，下次使用时再加载会产生延迟。开启持久模式能让驱动始终保持加载状态，降低延迟。
    *   **命令:**
        ```bash
        # 开启持久模式
        sudo nvidia-smi -pm 1
        ```

*   **设置GPU功耗上限 (Power Limit)**
    *   **目的:** 在某些对能耗比敏感或散热受限的场景，可以适当降低GPU的功耗上限，以在性能和能耗之间取得平衡。
    *   **命令:**
        ```bash
        # 查询GPU A100的功耗范围
        nvidia-smi -q -d POWER | grep "Power Limit"

        # 将0号GPU的功耗上限设置为350瓦
        sudo nvidia-smi -i 0 -pl 350
        ```
       

*   **调整GPU时钟频率 (Clock Speeds)**
    *   **目的:** 对于需要稳定、可复现性能的场景，可以手动锁定GPU的核心频率和显存频率。
    *   **命令:**
        ```bash
        # 查询支持的应用时钟频率
        nvidia-smi -q -d SUPPORTED_CLOCKS

        # 将0号GPU的核心频率和显存频率分别设置为1095MHz和877MHz
        # （数值需根据上一条命令的查询结果填写）
        sudo nvidia-smi -i 0 -ac 877,1095
        ```

*   **CPU亲和性 (CPU Affinity):**
    *   **目的:** 将一个进程或线程“绑定”到特定的一个或多个CPU核心上运行，避免操作系统在不同核心间频繁调度，减少缓存失效，提升性能。在多GPU卡的环境下，将驱动该卡的进程绑定到与该GPU物理连接最近的CPU核心上（NUMA优化），效果更佳。
    *   **工具:** `taskset` 或 `numactl`。
    *   **示例:**
        ```bash
        # 使用taskset将一个进程（PID为12345）绑定到CPU核心0和1上
        taskset -cp 0,1 12345
        ```

#### **6. NCCL测试及性能优化介绍**

NCCL (NVIDIA Collective Communications Library) 是一个用于实现多GPU、多节点间高效通信的库，是分布式训练的基石。 测试NCCL性能是衡量GPU集群网络健康状况的关键手段。

*   **获取并编译NCCL Tests**
    ```bash
    git clone https://github.com/NVIDIA/nccl-tests.git
    cd nccl-tests
    # 假设CUDA安装在/usr/local/cuda
    make -j src.build CUDA_HOME=/usr/local/cuda
    ```

*   **执行测试**
    *   **测试类型:** `all_reduce_perf`, `all_gather_perf`, `broadcast_perf` 等，其中 `all_reduce_perf` 最常用，它能很好地反映集群的综合通信能力。
    *   **单机8卡 All-Reduce 测试命令:**
        ```bash
        # -b 8: 最小消息尺寸为8字节
        # -e 1G: 最大消息尺寸为1GB
        # -f 2: 消息尺寸每次乘以2
        # -g 1: 使用1个GPU
        # 在单机内，可以用如下命令测试所有8张卡的性能
        ./build/all_reduce_perf -b 8 -e 1G -f 2 -g 8
        ```
    *   **跨节点 All-Reduce 测试 (需MPI环境, 如OpenMPI):**
        假设有2台服务器，每台8卡，共16个GPU。
        ```bash
        # 在主机上执行
        mpirun -np 16 --hostfile your_host_file --allow-run-as-root \
        -x LD_LIBRARY_PATH -x PATH \
        ./build/all_reduce_perf -b 8 -e 1G -f 2 -g 1
        ```
        `your_host_file` 是一个文本文件，内容为服务器IP或主机名，以及GPU数量，例如：
        ```
        192.168.1.101 slots=8
        192.168.1.102 slots=8
        ```

*   **解读测试结果**
    *   **关注 `busbw` (Bus Bandwidth) 列:** 这个值反映了实际的通信带宽。
    *   **理想情况:**
        *   **单机内部:** 对于通过NVLink连接的GPU，该值应接近理论带宽。对于PCIe连接的，则应接近PCIe的有效带宽。
        *   **跨节点:** 该值应接近服务器网卡的有效带宽（如InfiniBand的100/200/400 Gbps）。
    *   **问题排查:** 如果 `busbw` 远低于理论值，则表明通信存在瓶颈。可能的原因包括：驱动问题、网络配置错误、交换机拥塞、硬件故障、甚至是BIOS配置不当（如PCIe速率未设为最高）。

*   **NCCL性能优化**
    *   **拓扑感知:** 确保NCCL能正确识别服务器的硬件拓扑（CPU、GPU、NVLink、PCIe、网卡之间的连接关系）。通常现代NCCL版本会自动检测，但在复杂环境中，可能需要设置 `NCCL_TOPO_FILE` 环境变量来手动指定。
    *   **协议选择:** 通过 `NCCL_PROTO` 环境变量可以指定通信协议（`LL`, `LL128`, `Simple`）。一般无需手动设置，让NCCL自动选择即可。
    *   **算法选择:** `NCCL_ALGO` 可以指定使用 `Tree` 或 `Ring` 算法。`Ring` 算法在带宽足够时延迟较低，`Tree` 算法则在带宽受限时表现更优。同样，建议使用默认的自动选择。
    *   **核心原则:** 除非你非常清楚你在做什么，并且有明确的测试数据支持，否则**不要随意修改NCCL的默认环境变量**。 优化的第一步永远是确保底层硬件和驱动配置正确无误。

---
