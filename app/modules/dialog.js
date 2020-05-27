/**
 * 弹框
 */
layui.define(function(exports){
    var $ = layui.jquery,
        layer = layui.layer,
        form = layui.form,
        $form = $('form');

    /**
     * 表单提交弹框
     * @param _config
     */
    function formDialog(_config) {
        layer.open({
            id: _config.id || 1000,
            type: 5,   // 表单超出部分不被遮挡
            title: _config.title || '标题',
            area: _config.area || ['450px', 'auto'],
            btn: _config.btn || ['确定', '取消'],
            btnAlign: _config.btnAlign || 'r',   // 按钮居右对齐
            content: _config.content || 'content',
            success: _config.success || function(){},
            yes: _config.yesFn || function(index, layero){
                // 点击确认按钮触发form的隐藏提交
                layero.find('.submitBtn').click();
            },
            end: _config.endFn || function(){}
        });
    }

    function confirmDialog(_config) {
        layer.open({
            id: _config.id || 1001,
            type: 5,   // 表单超出部分不被遮挡
            title: _config.title || '标题',
            area: _config.area || ['450px', 'auto'],
            btn: _config.btn || ['确定', '取消'],
            btnAlign: _config.btnAlign || 'r',   // 按钮居右对齐
            content: '<div style="padding: 20px; line-height: 1.75;">'+ _config.content +'</div>',
            success: _config.success || function(){},
            yes: _config.yesFn || function(){},
            cancel: _config.cancelFn || function () {}
        });
    }

    function confirmDialog2(_config) {
        layer.open({
            id: _config.id || 1001,
            type: 5,   // 表单超出部分不被遮挡
            title: _config.title || '标题',
            area: _config.area || ['450px', 'auto'],
            btn: _config.btn || ['确定', '取消'],
            btnAlign: _config.btnAlign || 'r',   // 按钮居右对齐
            content: _config.content,
            success: _config.success || function(){},
            yes: _config.yesFn || function(){},
            cancel: _config.cancelFn || function () {}
        });
    }

    function delDialog(_config) {
        layer.open({
            id: 1002,
            type: 5,   // 表单超出部分不被遮挡
            title: _config.title || '删除',
            area: _config.area || ['450px', 'auto'],
            btn: _config.btn || ['确定', '取消'],
            btnAlign: _config.btnAlign || 'r',   // 按钮居右对齐
            content: _config.content || '<div style="padding: 20px; line-height: 1.75;">确定要删除吗？</div>',
            success: function(){},
            yes: _config.yesFn || function() {}
        });
    }

    function downloadDialog(_config) {
        var timer = null;
        layer.open({
            id: _config.id || 1111,
            type: 5,   // 表单超出部分不被遮挡
            title: _config.title || '下载提示',
            area: _config.area || ['450px', 'auto'],
            btn: _config.btn || ['关闭'],
            btnAlign: _config.btnAlign || 'r',   // 按钮居右对齐
            content: '<div style="padding: 20px; line-height: 1.75; text-align: center;">下载任务已启动，请前往<a class="c-link" href="'+ _config.downloadUrl +'">下载池</a>查看进度<p><span class="time">5</span>s后自动关闭</p></div>',
            success: _config.success || function(layero, index){
                var $time = layero.find('.time'),
                    time = 5;
                timer = setInterval(function() {
                    time -= 1;
                    $time.text(time);
                    if(time === 0) {
                        clearInterval(timer);
                        layer.close(index);
                    }
                }, 1000);
            },
            yes: _config.yesFn || function(index, layero){
                clearInterval(timer);
                layer.close(index);
            }
        });
    }

    // 【我知道了】弹框
    function tipDialog(_config) {
        layer.open({
            id: 1003,
            type: 5,   // 表单超出部分不被遮挡
            title: _config.title || '提示',
            area: _config.area || ['450px', 'auto'],
            btn: _config.btn || ['知道了'],
            btnAlign: _config.btnAlign || 'r',   // 按钮居右对齐
            content: '<div style="padding: 20px; line-height: 1.75;">'+ _config.content +'</div>',
            success: _config.success || function(){},
            yes: _config.yesFn || function(){}
        });
    }

    function errorDialog(content, callback) {
        layer.msg2(content, {time: 1800, icon: 5, shift: 0}, function () {
            callback && callback();
        });
    }

    function errorDialog2(param) {
        layer.msg2(param.content, {time: !param.time ? 1800 : param.time, icon: 5, shift: 0, zIndex: !param.zIndex ? 20000000 : param.zIndex}, function () {
            param.callback && param.callback();
        });
    }

    function successDialog(content, callback) {
        layer.msg2(content, {time: 1800, icon: 1, shift: 0}, function() {
            callback && callback();
        });
    }

    // 时间控制
    function successDialogByTime(content, time, callback) {
        layer.msg(content, {time: time, icon: 1, shift: 0}, function() {
            callback && callback();
        });
    }

    // 页面跳转
    function skipDialog() {
        layer.load(2, {
            content: '页面跳转中...',
            shade: [0.1, '#000'],
            success: function(layero) {
                layero.find('.layui-layer-content').css({
                    'padding-top': '40px',
                    'width': '100px',
                    'text-indent': '-20px'
                });
            }
        });
    }

    var dialogs = {
        formDialog: formDialog,
        confirmDialog: confirmDialog,
        confirmDialog2: confirmDialog2,
        delDialog: delDialog,
        tipDialog: tipDialog,
        errorDialog: errorDialog,
        errorDialog2: errorDialog2,
        successDialog: successDialog,
        downloadDialog: downloadDialog,
        successDialogByTime: successDialogByTime,
        skipDialog: skipDialog
    };

    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('Dialog', dialogs);
});