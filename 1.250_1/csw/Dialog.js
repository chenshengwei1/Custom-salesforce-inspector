
export class Dialog{

    static TYPE_INFO = 'info';
    static TYPE_WARNING = 'warning';
    static TYPE_ERROR = 'error';
    static TYPE_CONFIRM = 'confirm';
    /**
     * 弹出确认框
     * options= {
                type = 'info',
                title = '提示',
                message = '',
                confirmText = '确认',
                cancelText = '取消',
                onConfirm = function() {},
                onCancel = function() {}
            }
     * @param {*} msg 
     */
    open(options){
         
        // 在body创建一个html的div
        var div = document.createElement("div");
        div.id = "dialogContainer";
        div.innerHTML = this.create();
        document.body.appendChild(div);
        let showModal = this.addEvents();

         return new Promise((resolve, reject) => {
            

            showModal(options);

            document.getElementById("confirm").addEventListener("click", function(){
                resolve(true);
                document.body.removeChild(div);
            });

            document.getElementById("confirm").addEventListener("click", function(){
                resolve(false);
                document.body.removeChild(div);
            })});
    }

    create(){
       return  this.styles() + `<!-- 模态框模板 -->
    <div class="modal-overlay" id="modalOverlay">
        <div class="modal" id="modal">
            <div class="modal-header">
                <div class="modal-icon" id="modalIcon">!</div>
                <div class="modal-title" id="modalTitle">模态框标题</div>
            </div>
            <div class="modal-body">
                <p class="modal-message" id="modalMessage">这里是模态框的消息内容。</p>
            </div>
            <div class="modal-footer">
                <button class="modal-btn-secondary" id="modalCancelBtn">取消</button>
                <button class="modal-btn-primary" id="modalConfirmBtn">确认</button>
            </div>
        </div>
    </div>`
    }

    addEvents(){

        // 显示模态框的函数
        function showModal(options) {
            const {
                type = 'info',
                title = '提示',
                message = '',
                confirmText = '确认',
                cancelText = '取消',
                onConfirm = function() {},
                onCancel = function() {}
            } = options;
            
            const $overlay = $('#modalOverlay');
            const $modal = $('#modal');
            const $icon = $('#modalIcon');
            const $title = $('#modalTitle');
            const $message = $('#modalMessage');
            const $confirmBtn = $('#modalConfirmBtn');
            const $cancelBtn = $('#modalCancelBtn');
            
            // 移除之前的类
            $modal.removeClass('confirm info warning error');
            
            // 设置模态框类型和内容
            $modal.addClass(type);
            $title.text(title);
            $message.text(message);
            $confirmBtn.text(confirmText);
            $cancelBtn.text(cancelText);
            
            // 设置图标
            let iconText = '!';
            if (type === TYPE_INFO) iconText = 'i';
            if (type === TYPE_WARNING) iconText = '!';
            if (type === TYPE_ERROR) iconText = '×';
            $icon.text(iconText);
            
            // 显示/隐藏取消按钮
            if (type === TYPE_CONFIRM) {
                $cancelBtn.show();
            } else {
                $cancelBtn.hide();
            }
            
            // 显示模态框
            $overlay.addClass('active');
            
            // 绑定确认按钮事件
            $confirmBtn.off('click').on('click', function() {
                $overlay.removeClass('active');
                onConfirm();
            });
            
            // 绑定取消按钮事件
            $cancelBtn.off('click').on('click', function() {
                $overlay.removeClass('active');
                onCancel();
            });
            
            // 点击遮罩层关闭模态框
            $overlay.off('click').on('click', function(e) {
                if (e.target === this) {
                    $overlay.removeClass('active');
                    onCancel();
                }
            });
        }
            
            // // 绑定按钮事件
            // $('#confirmBtn').click(function() {
            //     showModal({
            //         type: 'confirm',
            //         title: '确认操作',
            //         message: '您确定要删除这个项目吗？此操作不可撤销。',
            //         onConfirm: function() {
            //             console.log('用户确认了操作');
            //         },
            //         onCancel: function() {
            //             console.log('用户取消了操作');
            //         }
            //     });
            // });
            
            // $('#infoBtn').click(function() {
            //     showModal({
            //         type: 'info',
            //         title: '信息提示',
            //         message: '您的个人资料已成功更新！'
            //     });
            // });
            
            // $('#warningBtn').click(function() {
            //     showModal({
            //         type: 'warning',
            //         title: '警告',
            //         message: '磁盘空间不足，请及时清理文件以释放空间。'
            //     });
            // });
            
            // $('#errorBtn').click(function() {
            //     showModal({
            //         type: 'error',
            //         title: '错误',
            //         message: '无法连接到服务器，请检查您的网络连接后重试。'
            //     });
            // });
            
            // // 复制代码功能
            // $('#copyBtn').click(function() {
            //     const code = $('pre').text();
            //     navigator.clipboard.writeText(code).then(function() {
            //         const $btn = $(this);
            //         $btn.text('已复制!');
            //         setTimeout(function() {
            //             $btn.text('复制代码');
            //         }, 2000);
            //     }.bind(this));
            // });
        return showModal;
    }

     styles(){
        return `<style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1000px;
            width: 100%;
            text-align: center;
        }
        
        h1 {
            margin: 20px 0;
            color: #2c3e50;
            font-weight: 600;
        }
        
        .description {
            margin-bottom: 30px;
            color: #7f8c8d;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .button-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .modal-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            min-width: 160px;
        }
        
        .confirm-btn {
            background: linear-gradient(to right, #3498db, #2980b9);
            color: white;
        }
        
        .info-btn {
            background: linear-gradient(to right, #2ecc71, #27ae60);
            color: white;
        }
        
        .warning-btn {
            background: linear-gradient(to right, #f39c12, #e67e22);
            color: white;
        }
        
        .error-btn {
            background: linear-gradient(to right, #e74c3c, #c0392b);
            color: white;
        }
        
        .modal-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        }
        
        .modal-btn:active {
            transform: translateY(0);
        }
        
        /* 模态框样式 */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .modal-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .modal {
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            width: 90%;
            max-width: 450px;
            overflow: hidden;
            transform: translateY(-50px);
            opacity: 0;
            transition: all 0.4s ease;
        }
        
        .modal-overlay.active .modal {
            transform: translateY(0);
            opacity: 1;
        }
        
        .modal-header {
            padding: 20px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #eee;
        }
        
        .modal-icon {
            width: 24px;
            height: 24px;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            color: white;
            font-weight: bold;
        }
        
        .modal.confirm .modal-icon {
            background-color: #3498db;
        }
        
        .modal.info .modal-icon {
            background-color: #2ecc71;
        }
        
        .modal.warning .modal-icon {
            background-color: #f39c12;
        }
        
        .modal.error .modal-icon {
            background-color: #e74c3c;
        }
        
        .modal-title {
            font-size: 20px;
            font-weight: 600;
        }
        
        .modal-body {
            padding: 25px 20px;
            text-align: left;
            line-height: 1.6;
        }
        
        .modal-message {
            margin-bottom: 0;
            color: #555;
        }
        
        .modal-footer {
            padding: 15px 20px;
            display: flex;
            justify-content: flex-end;
            border-top: 1px solid #eee;
            gap: 10px;
        }
        
        .modal-btn-secondary {
            padding: 8px 16px;
            background-color: #ecf0f1;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            color: #7f8c8d;
            transition: background-color 0.2s;
        }
        
        .modal-btn-primary {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            color: white;
            transition: background-color 0.2s;
        }
        
        .modal.confirm .modal-btn-primary {
            background-color: #3498db;
        }
        
        .modal.info .modal-btn-primary {
            background-color: #2ecc71;
        }
        
        .modal.warning .modal-btn-primary {
            background-color: #f39c12;
        }
        
        .modal.error .modal-btn-primary {
            background-color: #e74c3c;
        }
        
        .modal-btn-secondary:hover {
            background-color: #dfe6e9;
        }
        
        .modal-btn-primary:hover {
            opacity: 0.9;
        }
        
        .code-container {
            background-color: #2c3e50;
            border-radius: 8px;
            padding: 20px;
            color: white;
            text-align: left;
            margin-top: 30px;
            width: 100%;
            overflow-x: auto;
        }
        
        .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #3e546b;
        }
        
        .code-title {
            font-weight: 600;
            color: #ecf0f1;
        }
        
        .copy-btn {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        }
        
        .copy-btn:hover {
            background-color: #2980b9;
        }
        
        pre {
            margin: 0;
            line-height: 1.5;
            font-family: 'Fira Code', monospace;
            font-size: 14px;
        }
        
        @media (max-width: 600px) {
            .button-container {
                flex-direction: column;
                align-items: center;
            }
            
            .modal-btn {
                width: 100%;
                max-width: 280px;
            }
            
            .modal-footer {
                flex-direction: column;
            }
            
            .modal-btn-secondary, .modal-btn-primary {
                width: 100%;
            }
        }
    </style>`
    }
}