change master to
master_host='172.19.0.2',
master_port=3306,
master_user='root',
master_password='dinhpham',
master_log_file='binlog.000001',
master_log_pos =157,
master_connect_retry=60,
get_master_public_key=1;


STOP SLAVE;
CHANGE MASTER TO
MASTER_HOST = '172.19.0.2',
MASTER_USER = 'root',
MASTER_PASSWORD = 'dinhpham',
MASTER_PORT = 3306,
MASTER_AUTO_POSITION = 1;
START SLAVE;