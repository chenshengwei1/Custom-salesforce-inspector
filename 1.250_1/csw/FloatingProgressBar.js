export class FloatingProgressBar {
  constructor(options = {}) {
    this.options = {
      // 显示位置
      position: 'top', // 'top' 或 'bottom'
      // 进度条颜色
      color: '#3498db',
      backgroundColor: '#ecf0f1',
      // 进度条高度
      height: 4,
      // 是否显示百分比文字
      showPercentage: true,
      // 是否显示详细信息
      showDetails: true,
      // 自动隐藏
      autoHide: true,
      hideDelay: 2000,
      // 透明度
      opacity: 0.95,
      // 阴影
      shadow: true,
      // 圆角
      borderRadius: 2,
      // 显示关闭按钮
      showCloseButton: true,
      // 回调函数
      onComplete: null,
      onCancel: null,
      ...options
    };

    this.progress = 0;
    this.message = '';
    this.isVisible = false;
    this.startTime = null;
    this.estimatedTime = null;
    this.init();
  }

  init() {
    // 创建容器
    this.container = document.createElement('div');
    this.container.id = 'floating-progress-bar';
    this.container.style.cssText = `
      position: fixed;
      ${this.options.position === 'top' ? 'top: 0;' : 'bottom: 0;'}
      left: 0;
      right: 0;
      z-index: 999999;
      background-color: rgba(255, 255, 255, ${this.options.opacity});
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      ${this.options.shadow ? 'box-shadow: 0 2px 10px rgba(0,0,0,0.1);' : ''}
      padding: 12px 20px;
      transform: translateY(${this.options.position === 'top' ? '-100%' : '100%'});
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border-bottom: ${this.options.position === 'top' ? '1px solid rgba(0,0,0,0.1)' : 'none'};
      border-top: ${this.options.position === 'bottom' ? '1px solid rgba(0,0,0,0.1)' : 'none'};
    `;

    // 创建内部容器
    this.innerContainer = document.createElement('div');
    this.innerContainer.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      gap: 20px;
    `;

    // 左侧区域：进度信息
    this.leftSection = document.createElement('div');
    this.leftSection.style.cssText = `
      flex: 1;
      min-width: 0;
    `;

    // 进度文本
    this.textContainer = document.createElement('div');
    this.textContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;
      color: #2c3e50;
    `;

    this.messageElement = document.createElement('span');
    this.messageElement.style.cssText = `
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    `;

    this.percentageElement = document.createElement('span');
    this.percentageElement.style.cssText = `
      font-weight: bold;
      margin-left: 12px;
      color: ${this.options.color};
      min-width: 45px;
      text-align: right;
    `;

    // 进度条容器
    this.progressContainer = document.createElement('div');
    this.progressContainer.style.cssText = `
      height: ${this.options.height}px;
      background-color: ${this.options.backgroundColor};
      border-radius: ${this.options.borderRadius}px;
      overflow: hidden;
      position: relative;
    `;

    // 进度条
    this.progressBar = document.createElement('div');
    this.progressBar.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 0%;
      background-color: ${this.options.color};
      border-radius: ${this.options.borderRadius}px;
      transition: width 0.2s ease-out;
      background-image: linear-gradient(
        45deg,
        rgba(255,255,255,0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255,255,255,0.15) 50%,
        rgba(255,255,255,0.15) 75%,
        transparent 75%,
        transparent
      );
      background-size: 20px 20px;
      animation: progress-stripes 1s linear infinite;
    `;

    // 创建动画
    const style = document.createElement('style');
    style.textContent = `
      @keyframes progress-stripes {
        from { background-position: 20px 0; }
        to { background-position: 0 0; }
      }
    `;
    document.head.appendChild(style);

    // 右侧区域：控制按钮和详细信息
    this.rightSection = document.createElement('div');
    this.rightSection.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    `;

    // 详细信息
    this.detailsElement = document.createElement('div');
    this.detailsElement.style.cssText = `
      font-size: 12px;
      color: #7f8c8d;
      white-space: nowrap;
      display: ${this.options.showDetails ? 'block' : 'none'};
    `;

    // 取消按钮
    this.cancelButton = document.createElement('button');
    this.cancelButton.innerHTML = '❌';
    this.cancelButton.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      padding: 4px 8px;
      border-radius: 4px;
      color: #e74c3c;
      transition: background-color 0.2s;
      display: none;
      opacity: 0.7;
    `;
    this.cancelButton.addEventListener('mouseenter', () => {
      this.cancelButton.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
    });
    this.cancelButton.addEventListener('mouseleave', () => {
      this.cancelButton.style.backgroundColor = 'transparent';
    });
    this.cancelButton.addEventListener('click', () => {
      this.cancel();
    });

    // 关闭按钮
    if (this.options.showCloseButton) {
      this.closeButton = document.createElement('button');
      this.closeButton.innerHTML = '✕';
      this.closeButton.style.cssText = `
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        color: #95a5a6;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      `;
      this.closeButton.addEventListener('mouseenter', () => {
        this.closeButton.style.backgroundColor = 'rgba(149, 165, 166, 0.1)';
        this.closeButton.style.color = '#7f8c8d';
      });
      this.closeButton.addEventListener('mouseleave', () => {
        this.closeButton.style.backgroundColor = 'transparent';
        this.closeButton.style.color = '#95a5a6';
      });
      this.closeButton.addEventListener('click', () => {
        this.hide();
      });
    }

    // 组装DOM结构
    this.textContainer.appendChild(this.messageElement);
    if (this.options.showPercentage) {
      this.textContainer.appendChild(this.percentageElement);
    }

    this.progressContainer.appendChild(this.progressBar);
    
    this.leftSection.appendChild(this.textContainer);
    this.leftSection.appendChild(this.progressContainer);

    this.rightSection.appendChild(this.detailsElement);
    this.rightSection.appendChild(this.cancelButton);
    if (this.options.showCloseButton) {
      this.rightSection.appendChild(this.closeButton);
    }

    this.innerContainer.appendChild(this.leftSection);
    this.innerContainer.appendChild(this.rightSection);
    this.container.appendChild(this.innerContainer);

    document.body.appendChild(this.container);
  }

  show(message = '处理中...') {
    this.message = message;
    this.isVisible = true;
    this.startTime = Date.now();
    
    // 更新显示
    this.messageElement.textContent = message;
    this.container.style.transform = 'translateY(0)';
    
    // 显示取消按钮
    this.cancelButton.style.display = 'block';
  }

  update(progress, message = null, details = null) {
    this.progress = Math.max(0, Math.min(100, progress));
    
    if (message) {
      this.message = message;
      this.messageElement.textContent = message;
    }
    
    // 更新进度条
    this.progressBar.style.width = `${this.progress}%`;
    
    // 更新百分比
    if (this.options.showPercentage) {
      this.percentageElement.textContent = `${Math.round(this.progress)}%`;
    }
    
    // 更新详细信息
    if (this.options.showDetails && details) {
      this.detailsElement.textContent = details;
    }
    
    // 计算剩余时间
    if (this.startTime && this.progress > 0) {
      const elapsed = Date.now() - this.startTime;
      const estimatedTotal = elapsed / (this.progress / 100);
      const remaining = estimatedTotal - elapsed;
      
      if (remaining > 0) {
        this.detailsElement.textContent = this.formatTime(remaining) + ' 剩余';
      }
    }
    if (!this.isCompleted && this.progress == 100){
        this.complete();
    }
  }

  complete(message = '完成！') {
    this.isCompleted = true;
    this.update(100, message);
    
    // 进度条动画完成效果
    this.progressBar.style.transition = 'width 0.5s ease-out';
    this.progressBar.style.backgroundImage = 'none';
    
    // 触发回调
    if (this.options.onComplete) {
      this.options.onComplete();
    }
    
    // 自动隐藏
    if (this.options.autoHide) {
      setTimeout(() => {
        this.hide();
      }, this.options.hideDelay);
    }
    
    // 隐藏取消按钮
    this.cancelButton.style.display = 'none';
  }

  cancel() {
    if (this.options.onCancel) {
      this.options.onCancel();
    }
    this.hide();
  }

  hide() {
    this.isVisible = false;
    this.container.style.transform = `translateY(${
      this.options.position === 'top' ? '-100%' : '100%'
    })`;
    
    // 重置状态
    setTimeout(() => {
      this.progress = 0;
      this.progressBar.style.width = '0%';
      this.progressBar.style.transition = 'width 0.2s ease-out';
      this.progressBar.style.backgroundImage = `
        linear-gradient(
          45deg,
          rgba(255,255,255,0.15) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255,255,255,0.15) 50%,
          rgba(255,255,255,0.15) 75%,
          transparent 75%,
          transparent
        )
      `;
      this.percentageElement.textContent = '0%';
      this.detailsElement.textContent = '';
      this.cancelButton.style.display = 'none';
    }, 300);
  }

  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
      return `${seconds}秒`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}分${remainingSeconds}秒`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}小时${minutes}分`;
    }
  }

  // 更新详细信息
  setDetails(details) {
    if (this.options.showDetails) {
      this.detailsElement.textContent = details;
    }
  }

  // 获取当前进度
  getProgress() {
    return this.progress;
  }

  // 销毁组件
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}