/**
 * 统一启动所有服务脚本
 * 
 * 该脚本同时启动所有配置的端口服务:
 * - 客户端前端 (端口3000)
 * - 客户端API (端口5001)
 * - 管理后台前端 (端口3001)
 * - 管理后台API (端口8080)
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const colors = require('colors/safe');
const portConfig = require('../config/ports');

// 打印配置信息
console.log(colors.cyan('======= 端口配置信息 ======='));
console.log(colors.yellow(`客户端前端: ${portConfig.CLIENT_FRONTEND_PORT}`));
console.log(colors.yellow(`客户端API: ${portConfig.CLIENT_API_PORT}`));
console.log(colors.yellow(`管理后台前端: ${portConfig.ADMIN_FRONTEND_PORT}`));
console.log(colors.yellow(`管理后台API: ${portConfig.ADMIN_API_PORT}`));
console.log(colors.cyan('==========================\n'));

// 检查端口是否被占用
const checkPortInUse = (port) => {
  const netstat = spawn('netstat', ['-ano'], { shell: true });
  return new Promise((resolve) => {
    let data = '';
    netstat.stdout.on('data', (chunk) => {
      data += chunk;
    });
    
    netstat.on('close', () => {
      const isInUse = data.includes(`:${port} `);
      resolve(isInUse);
    });
  });
};

// 终止特定端口的进程
const killProcessOnPort = async (port) => {
  try {
    console.log(colors.yellow(`尝试释放端口 ${port}...`));
    const findPid = spawn('netstat', ['-ano', '|', 'findstr', `:${port}`], { shell: true });
    let output = '';
    
    findPid.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    await new Promise((resolve) => {
      findPid.on('close', resolve);
    });
    
    // 提取PID
    const lines = output.split('\n').filter(line => line.includes(`:${port} `));
    if (lines.length > 0) {
      const pidMatch = lines[0].match(/\s+(\d+)$/);
      if (pidMatch && pidMatch[1]) {
        const pid = pidMatch[1];
        console.log(colors.yellow(`正在终止进程 PID: ${pid}`));
        await spawn('taskkill', ['/F', '/PID', pid], { shell: true });
        console.log(colors.green(`端口 ${port} 已释放`));
      }
    }
  } catch (err) {
    console.error(colors.red(`无法释放端口 ${port}:`, err));
  }
};

// 检查.env文件中的端口配置
const checkAndUpdateEnvFile = async () => {
  const envPath = path.resolve(process.cwd(), '.env');
  let envContent;
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (err) {
    console.error(colors.red('无法读取 .env 文件！'));
    process.exit(1);
  }

  // 更新.env文件中的端口配置
  const updatedEnvContent = envContent.replace(
    /PORT=\d+/,
    `PORT=${portConfig.CLIENT_API_PORT}`
  );

  if (envContent !== updatedEnvContent) {
    try {
      fs.writeFileSync(envPath, updatedEnvContent);
      console.log(colors.green(`已更新 .env 文件中的API端口为 ${portConfig.CLIENT_API_PORT}`));
    } catch (err) {
      console.error(colors.red('无法更新 .env 文件！'), err);
    }
  }
};

// 启动客户端API服务
const startClientAPI = () => {
  console.log(colors.green(`正在启动客户端API服务 (端口 ${portConfig.CLIENT_API_PORT})...`));
  const serverProcess = spawn('nodemon', ['server/server.js'], {
    stdio: 'inherit',
    shell: true
  });

  serverProcess.on('error', (err) => {
    console.error(colors.red('启动客户端API服务失败:'), err);
  });

  return serverProcess;
};

// 启动客户端前端
const startClientFrontend = () => {
  console.log(colors.green(`正在启动客户端前端 (端口 ${portConfig.CLIENT_FRONTEND_PORT})...`));
  const frontendProcess = spawn('react-scripts', ['start'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: portConfig.CLIENT_FRONTEND_PORT, BROWSER: 'none' }
  });

  frontendProcess.on('error', (err) => {
    console.error(colors.red('启动客户端前端失败:'), err);
  });

  return frontendProcess;
};

// 启动管理后台前端
const startAdminFrontend = () => {
  console.log(colors.green(`正在启动管理后台前端 (端口 ${portConfig.ADMIN_FRONTEND_PORT})...`));
  
  // 检查管理后台目录是否存在
  const adminDir = path.resolve(process.cwd(), 'admin-client');
  if (!fs.existsSync(adminDir)) {
    console.log(colors.yellow('管理后台目录不存在，跳过启动管理后台前端'));
    return null;
  }
  
  // 启动管理后台前端服务
  const adminProcess = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    cwd: adminDir,
    env: { ...process.env, PORT: portConfig.ADMIN_FRONTEND_PORT, BROWSER: 'none' }
  });

  adminProcess.on('error', (err) => {
    console.error(colors.red('启动管理后台前端失败:'), err);
  });

  return adminProcess;
};

// 启动管理后台API
const startAdminAPI = () => {
  console.log(colors.green(`正在启动管理后台API (端口 ${portConfig.ADMIN_API_PORT})...`));
  
  // 检查管理后台服务器目录是否存在
  const adminServerDir = path.resolve(process.cwd(), 'admin-server');
  if (!fs.existsSync(adminServerDir)) {
    console.log(colors.yellow('管理后台服务器目录不存在，跳过启动管理后台API'));
    return null;
  }
  
  // 启动管理后台API服务
  const adminApiProcess = spawn('nodemon', ['app.js'], {
    stdio: 'inherit',
    shell: true,
    cwd: adminServerDir,
    env: { ...process.env, PORT: portConfig.ADMIN_API_PORT }
  });

  adminApiProcess.on('error', (err) => {
    console.error(colors.red('启动管理后台API失败:'), err);
  });

  return adminApiProcess;
};

// 启动所有服务
const startAllServices = async () => {
  console.log(colors.cyan('正在检查端口占用情况...'));
  
  // 检查并更新.env文件
  await checkAndUpdateEnvFile();
  
  // 检查并释放可能被占用的端口
  const portsToCheck = [
    portConfig.CLIENT_FRONTEND_PORT,
    portConfig.CLIENT_API_PORT,
    portConfig.ADMIN_FRONTEND_PORT,
    portConfig.ADMIN_API_PORT
  ];
  
  for (const port of portsToCheck) {
    const isInUse = await checkPortInUse(port);
    if (isInUse) {
      await killProcessOnPort(port);
    }
  }
  
  console.log(colors.cyan('正在启动所有服务...'));
  
  const processes = {
    clientAPI: startClientAPI(),
    clientFrontend: startClientFrontend(),
    adminFrontend: startAdminFrontend(),
    adminAPI: startAdminAPI()
  };

  // 处理进程退出
  const handleExit = () => {
    console.log(colors.yellow('\n正在关闭所有服务...'));
    Object.values(processes).forEach(process => {
      if (process && !process.killed) {
        process.kill();
      }
    });
    process.exit(0);
  };

  // 捕获退出信号
  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
};

// 启动脚本
startAllServices(); 