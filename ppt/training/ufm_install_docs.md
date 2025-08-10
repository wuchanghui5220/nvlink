Installing UFM on Docker Container - High Availability Mode
Pre-Deployments Requirements
Install pacemaker, pcs, and drbd-utils on both servers

For Ubuntu:

apt install pcs pacemaker drbd-utils


For CentOS/Red Hat:

yum install pcs pacemaker drbd84-utils kmod-drbd84


OR

yum install pcs pacemaker drbd90-utils kmod-drbd90


A partition for DRBD on each server (with the same name on both servers) such as /dev/sdd1. Recommended partition size is 10-20 GB, otherwise DRBD sync will take a long time to complete.

CLI command hostname -i must return the IP address of the management interface used for pacemaker sync correctly (update /etc/hosts/ file with machine IP)

Create the directory on each server under /opt/ufm/files/ with read/write permissions on each server. This directory will be used by UFM to mount UFM files, and it will be synced by DRBD.

Disable the firewall service (/etc/init.d/iptables stop), or ensure that the required ports are open (see the prerequisite script).

Disable SELinux.

Installing UFM Containers
On the main server, install UFM Enterprise container with the command below:

docker run -it --name=ufm_installer --rm \
-v /var/run/docker.sock:/var/run/docker.sock \
-v /etc/systemd/system/:/etc/systemd_files/ \
-v /opt/ufm/files/:/installation/ufm_files/ \
-v /tmp/license_file/:/installation/ufm_licenses/ \
mellanox/ufm-enterprise:latest \
--install


On the standby (secondary) server, install the UFM Enterprise container like the following example with the command below:

docker run -it --name=ufm_installer --rm \
-v /var/run/docker.sock:/var/run/docker.sock \
-v /etc/systemd/system/:/etc/systemd_files/ \
-v /opt/ufm/files/:/installation/ufm_files/ \
mellanox/ufm-enterprise:latest \
--install


Downloading UFM HA Package
Download the UFM-HA package on both servers using the following command:

wget https://www.mellanox.com/downloads/ufm/ufm_ha/5.8.0/ufm_ha_5.8.0-4.tgz


For sha256:

wget https://www.mellanox.com/downloads/ufm/ufm_ha/5.8.0/ufm_ha_5.8.0-4.sha256


Installing UFM HA Package
For more information on the UFM-HA package and all installation and configuration options, please refer to UFM High Availability User Guide.

[On Both Servers] Extract the downloaded UFM-HA package under /tmp/

[On Both Servers] Go to the extracted directory /tmp/ufm_ha_XXX and run the installation script. For example, if your DRBD partition is /dev/sda5 run the following command:

./install.sh -l /opt/ufm/files/ -d /dev/sda5 -p enterprise


Configuring UFM HA
There are the three methods to configure the HA cluster:

Configure HA with SSH Trust (Dual Link Configuration)
On the master server only, configure the HA nodes. To do so, from /tmp, run the configure_ha_nodes.shcommand as shown in the below example

configure_ha_nodes.sh \ 
--cluster-password 12345678 \ 
--master-primary-ip 10.10.50.1 \ 
--standby-primary-ip 10.10.50.2 \ 
--master-secondary-ip 192.168.10.1 \ 
--standby-secondary-ip 192.168.10.2 \ 
--no-vip 






Depending on the size of your partition, wait for the configuration process to complete and DRBD sync to finish. To check the DRBD sync status, run:

ufm_ha_cluster status 





Starting HA Cluster

To start UFM HA cluster:

 ufm_ha_cluster start 


To check UFM HA cluster status:

ufm_ha_cluster status 


To stop UFM HA cluster:

ufm_ha_cluster stop 


To uninstall UFM HA, first stop the cluster and then run the uninstallation command as follows:

/opt/ufm/ufm_ha/uninstall_ha.sh 



