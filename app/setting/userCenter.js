/**
 * 设置-用户中心
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex', 'upload', 'MUpload', 'Cropper'], function() {
    var $ = layui.jquery,
        element = layui.element,
        form = layui.form;
    var Common = layui.Common;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;
    var Cropper = layui.Cropper;
    var myCropper,
        maxSize = 2,
        CW = 200,       // 图片裁剪尺寸
        CH = 200;

    form.verify({
        pwd: function(value, item) {
            if(!$.trim(value)) {
                return Regex.pwd.msg;
            }
            if(Regex.space.reg.test(value)) {
                return Regex.space.msg;
            }

            if(Regex.chinese.reg.test(value)) {
                return Regex.chinese.msg;
            }

            if(!Regex.pwd.reg.test(value)) {
                return Regex.pwd.msg;
            }
        }
    });

    form.on('submit(doSubmit)', function(data) {
        var $elem = $(data.elem),
            url = $elem.attr('data-url');
        var param = $('form').serializeArray();
        var pwd = $('input[name=newpwd]').val(),
            pwd2 = $('input[name=confirmpwd]').val();
        if(pwd !== pwd2) {
            Dialog.errorDialog('两次输入的密码不一致，请重新输入');
            return false;
        }
        Req.postReq(url, param, function(res) {
            if(res.status) {
                Dialog.successDialog(res.msg, function () {
                    // window.location.reload();
                    window.location.href = location.pathname + '?type=1';
                });
            } else {
                Dialog.errorDialog(res.msg);
            }
        });

        return false;
    });

    function getCropperHtml(_src) {
        var _html = '<div style="padding: 0 15px;">' +
                        '<div style="text-align: center;">宽度：'+ CW +'px, 高度：'+ CH +'px</div>' +
                        '<div class="cropper-wrapper pl-20 pr-20" style="height: 460px; overflow:hidden;">' +
                        '<div class="img-container" style="height: 460px;">' +
                            '<img src="'+ _src +'" id="image" style="max-width: 100%;" class="cropper-hidden">'+
                        '</div>' +
                        '</div>' +
                    '</div>';
        return _html;
    }

    function getParamStr(obj) {
        var result = [];
        for(var key in obj) {
            result.push(key + '=' + obj[key]);
        }
        return result.join('&');
    }

    $(function() {
        MUpload({
            elem: $('.upload'),
            exts: 'jpg|jpeg|png',
            size: 2 * 1024,
            choose: function() {
                layer.load(2, {shade: [0.1, '#000']});
            },
            before: function(){return true;},
            done: function(res) {
                layer.closeAll();
                if(res.success) {
                    var tempImg = new Image();
                    tempImg.src = res.data.webPath;
                    tempImg.onload = function () {
                        var _w = tempImg.width,
                            _h = tempImg.height;

                        if(_w < CW || _h < CH) {
                            Dialog.errorDialog('图片最小尺寸为：' + CW + '*' + CH + '，当前尺寸为：' + _w + '*' + _h);
                            return false;
                        }

                        Dialog.confirmDialog({
                            title: '编辑图片',
                            content: getCropperHtml(res.data.webPath),
                            area:['700px', '600px'],
                            btn: ['确定', '取消'],
                            success: function() {
                                var image = document.querySelector('#image'),
                                    minCroppedWidth = parseInt(CW),
                                    minCroppedHeight = parseInt(CH),
                                    maxCroppedWidth = parseInt(CW),
                                    maxCroppedHeight = parseInt(CH);

                                myCropper = new Cropper(image, {
                                    viewMode: 2,
                                    // autoCrop: false,
                                    ready: function() {
                                        // this.cropper.crop();
                                    },

                                    crop: function (event) {
                                        var width = Math.round(event.detail.width);
                                        var height = Math.round(event.detail.height);

                                        if (width < minCroppedWidth || height < minCroppedHeight
                                            || width > maxCroppedWidth || height > maxCroppedHeight ) {
                                            myCropper.setData({
                                                width: Math.max(minCroppedWidth, Math.min(maxCroppedWidth, width)),
                                                height: Math.max(minCroppedHeight, Math.min(maxCroppedHeight, height)),
                                            });
                                        }
                                    },
                                });
                            },
                            yesFn: function() {
                                var cropData = myCropper.getData(true);
                                var param = {
                                    x: cropData.x,
                                    y: cropData.y,
                                    // w: cropData.width,
                                    // h: cropData.height,
                                    w: CW,
                                    h: CH,
                                    size: 1,    // 放大或缩小倍数
                                    fileId: res.data.fileId
                                };
                                var url = 'http://ibs.'+ Common.getRootDomain() +'/oibs/api/common/file/saveView?' + getParamStr(param);


                                Req.getReq(url, function(res) {
                                    if(res.success) {
                                        Dialog.successDialog('上传成功', function () {
                                            var uploadUrl = $('.upload').attr('data-url');
                                            uploadUrl = uploadUrl + '?id=' + res.data.fileId + '&webPath=' + res.data.webPath;
                                            Req.getReq(uploadUrl, function (info) {
                                                if(info.status) {
                                                    window.location.reload();
                                                } else {
                                                    Dialog.errorDialog(info.msg);
                                                }
                                            })
                                        });
                                    } else {
                                        Dialog.errorDialog(res.errorMessage);
                                    }
                                });
                            }
                        });
                    };
                }
            }
        })

        $(document).on('click', '.ajaxweixin', function () {
            var url = $(this).attr('data-url');
            Dialog.confirmDialog({
                title: '解除绑定微信',
                content: '您确定要解除绑定的微信账号？',
                yesFn: function (index, layero) {
                    Req.getReqCommon(url);
                }
            });
        });

        // $(document).on('click', '#doSubmit', function () {
        //     var url = $(this).attr('data-url'),
        //         data = $('form').serializeArray();
        //     var pwd = $('input[name=newpwd]').val(),
        //         pwd2 = $('input[name=confirmpwd]').val();
        //     if(pwd !== pwd2) {
        //         Dialog.errorDialog('两次输入的密码不一致，请重新输入');
        //         return false;
        //     }
        //     Req.postReq(url, data, function(res) {
        //         if(res.status) {
        //             Dialog.successDialog(res.msg);
        //         } else {
        //             Dialog.errorDialog(res.msg);
        //         }
        //     });
        // });
    });
});