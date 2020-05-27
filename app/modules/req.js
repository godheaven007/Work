layui.define(function(exports){
    var $ = layui.jquery,
        Dialog = layui.Dialog,
        layer = layui.layer;


    function getReq(url, callback, type) {
        // var layerIndex = layer.load(2, {shade: [0.1, '#000']});
        $.ajax({
            url: url,
            type: 'GET',
            dataType: type || 'json',
        })
            .done(function(res) {
                callback(res);
            })
            .always(function() {
                // layer.close(layerIndex);
            });
    }

    function getReqCommon(url) {
        // var layerIndex = layer.load(2, {shade: [0.1, '#000']});
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
        })
        .done(function(res) {
            if (res.status) {
                Dialog.successDialog(res.msg, function() {
                    if (res.data.url) {
                        window.location.href = res.data.url;
                    } else {
                        window.location.reload();
                    }
                });
            } else {
                Dialog.errorDialog(res.msg);
            }
        })
        .always(function() {
            // layer.close(layerIndex);
            });
    }

    function postReq(url, data, callback) {
        var layerIndex = layer.load(2, {shade: [0.1, '#000']});
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: data
        })
        .done(function(res) {
            callback(res);
        })
        .always(function() {
            layer.close(layerIndex);
        });
    }

    function postReqCommon(url, data) {
        var layerIndex = layer.load(2, {shade: [0.1, '#000']});
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: data
        })
        .done(function(res) {
            if (res.status) {
                Dialog.successDialog(res.msg, function() {
                    if (res.data.url) {
                        Dialog.skipDialog();
                        window.location.href = res.data.url;
                    } else {
                        window.location.reload();
                    }
                });
            } else {
                Dialog.errorDialog(res.msg);
            }
        })
        .always(function() {
            layer.close(layerIndex);
        });
    }

    // 切换公司\园区用
    function postReqCommon2(url, data) {
        var layerIndex = layer.load(2, {shade: [0.1, '#000']});
        $.ajax({
            url: url,
            type: 'POST',
            dataType: 'json',
            data: data
        })
            .done(function(res) {
                if (res.status) {
                    Dialog.successDialog('切换成功', function() {
                        if (res.data.url) {
                            window.location.href = res.data.url;
                        } else {
                            window.location.reload();
                        }
                    });
                } else {
                    Dialog.errorDialog(res.msg, function () {
                        if (res.data.url) {
                            window.location.href = res.data.url;
                        } else {
                            window.location.reload();
                        }
                    });
                }
            })
            .always(function() {
                layer.close(layerIndex);
            });
    }


    var Request = {
        getReq: getReq,
        getReqCommon: getReqCommon,
        postReq: postReq,
        postReqCommon: postReqCommon,
        postReqCommon2: postReqCommon2
    };
    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('Req', Request);
});