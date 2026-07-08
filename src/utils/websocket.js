class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {
      notification: [],
      message: []
    };
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }
  
  connect() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('WebSocket连接失败: 没有找到token');
      return;
    }
    
    // 前端运行在端口3000，但WebSocket服务在后端5001端口
    const wsHost = 'localhost:5001';
    const wsUrl = `ws://${wsHost}/ws?token=${token}`;
    
    console.log(`尝试连接WebSocket: ${wsUrl}`);
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('WebSocket连接已成功建立');
      this.reconnectAttempts = 0;
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('收到WebSocket消息:', data);
        if (data.type && this.listeners[data.type]) {
          this.listeners[data.type].forEach(callback => callback(data.data));
        }
      } catch (error) {
        console.error('处理WebSocket消息出错:', error);
      }
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket连接已关闭');
      this.attemptReconnect();
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket错误:', error);
      this.socket.close();
    };
  }
  
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const timeout = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts));
      console.log(`尝试重新连接 #${this.reconnectAttempts}, 等待${timeout}ms`);
      setTimeout(() => this.connect(), timeout);
    }
  }
  
  addListener(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type].push(callback);
    }
    return () => this.removeListener(type, callback);
  }
  
  removeListener(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    }
  }
  
  close() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
