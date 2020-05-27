layui.define(function(exports){
    var $ = layui.jquery,
        upload = layui.upload,
        Dialog = layui.Dialog,
        device = layui.device(),
        layer = layui.layer;

    var getRootDomain = function() {
        var host = "null",
            url,
            origin;
        if (typeof url == "undefined" || null == url)
            url = window.location.href;
        origin = url.split('?')[0];
        var regex = /.*\:\/\/([^\/|:]*).*/;
        var matchVal = origin.match(regex);
        if (typeof matchVal != "undefined" && null != matchVal) {
            host = matchVal[1];
        }
        if (typeof host != "undefined" && null != host) {
            var strAry = host.split(".");
            if (strAry.length > 1) {
                host = strAry[strAry.length - 2] + "." + strAry[strAry.length - 1];
            }
        }
        return host;
    };

    // 默认以文件图标+文件名的方式
    function getUploadItem(data, index, isShowUrl) {
        // 区分多个上传组件的fileId
        var _index = !index ? '' : index;
        var _html = '<div class="upload-file-item">' +
                        '<i class="file-icon '+ data.fileType +'"></i>' +
                        '<a class="upload-file-name" href="'+ data.webPath +'" target="_blank">'+ data.fileName +'</a>' +
                        '<i class="upload-file-remove" data-id="'+ data.fileId +'"></i>' +
                        '<input type="hidden" name="fileId'+ _index +'[]" value="'+ data.fileId +'">';
        if(isShowUrl == '1') {
            _html += '<input type="hidden" name="fileUrl'+ _index +'[]" value="'+ data.webPath +'">';
        }
        _html +=
                    '</div>';
        return _html;
    }

    // 图片预览方式
    function getUploadPreviewItem(data, index, isShowUrl) {
        // 区分多个上传组件的fileId
        var _index = !index ? '' : index;
        var _html = '<div class="upload-file-item file-prev">' +
            '<a href="'+ data.webPath +'" target="_blank"><img src="'+ data.webPath +'" class="file-img" width="78" height="78"></a>' +
            '<i class="upload-file-remove" data-id="'+ data.fileId +'"></i>' +
            '<input type="hidden" name="fileId'+ _index +'[]" value="'+ data.fileId +'">';
        if(isShowUrl == '1') {
            _html += '<input type="hidden" name="fileUrl'+ _index +'[]" value="'+ data.webPath +'">';
        }
        _html +=
            '</div>';
        return _html;
    }

    function getUploadPreviewItem2(data, index, isShowUrl) {
        // 区分多个上传组件的fileId
        var _index = !index ? '' : index;
        var _html = '<div class="upload-file-item file-prev">' +
            '<a href="'+ data.webPath +'" target="_blank"><img src="'+ data.webPath +'" class="file-img" width="260" height="180"></a>' +
            '<input type="hidden" name="fileId'+ _index +'[]" value="'+ data.fileId +'">';
        if(isShowUrl == '1') {
            _html += '<input type="hidden" name="fileUrl'+ _index +'[]" value="'+ data.webPath +'">';
        }
        _html +=
            '</div>';
        return _html;
    }

    // 获取上传地址
    function getUploadUrl() {
        var orgin = '',
            uploadUrl = '';
        if (!window.location.origin) {
            orgin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
        } else {
            orgin = window.location.origin;
        }
        if(orgin.indexOf('oms') != -1) {
            if (device.ie && device.ie < 10) {
                uploadUrl = orgin + '/oms/api/common/file/upload2/';
            } else {
                uploadUrl = orgin + '/oms/api/common/file/upload/';
            }
        } else {
            if (device.ie && device.ie < 10) {
                uploadUrl = orgin + '/oibs/api/common/file/upload2/';
            } else {
                uploadUrl = orgin + '/oibs/api/common/file/upload/';
            }
        }
        return uploadUrl;
    }


    function getConfig(_config) {

        var config = {
            elem: _config.elem || '.upload',
            iframeIndex: _config.iframeIndex || 0,                // IE用，每个上传file对应一个iframe，防止上传至同一区域
            url: _config.url || getUploadUrl(),
            size: _config.size || 1024 * 50,                      // 单个文件不能超过多大
            maxNum: _config.maxNum || 50,                         // 上传个数限制
            accept: _config.accept || 'file',
            method: _config.method || 'post',
            replace: _config.replace || false,                                       // 上传文件个数为1时，在已上传情况下，直接更换图片，不需要文件个数限制提示
            fileAccept: 'image/*',
            exts: _config.exts || 'txt|doc|docx|xls|xlsx|ppt|pptx|psd|pda|pdf|jpg|jpeg|png|gif|rar|zip|7z|wav|mp3',
            data: {
                //额外参数
                filePolicy: _config.filePolicy || 'inside'            // [inside, web]
            },
            choose: _config.choose || function(){
            },
            before: _config.before || function(obj){
                if(!_config.replace) {
                    // 文件个数限制
                    var $uploadWrapper = $(this.item).parent().parent(),
                        $uploadItems = $uploadWrapper.find('.upload-file-item');

                    if($uploadItems.length >= parseInt(this.maxNum)) {
                        Dialog.errorDialog('最多上传'+ this.maxNum +'个文件');
                        return false;
                    }
                    return true;
                } else {
                    return true;
                }
            },
            done: _config.done || function(res){
                if(res.success) {
                    var $curUploadBtn = $(this.item),
                        index = $curUploadBtn.attr('data-index'),
                        isShowUrl = $curUploadBtn.attr('data-show-url'),
                        showMode = $curUploadBtn.attr('data-show-mode'),            // default:文件展示 1: 图片预览方式 2: 图片预览方式2（身份证类型）
                        $uploadWrapper = $curUploadBtn.parent().parent(),
                        $uploadList = $uploadWrapper.find('.upload-list');

                    if(_config.replace) {
                        // 更换照片
                        if(showMode == '1') {
                            $uploadList.html(getUploadPreviewItem(res.data, index, isShowUrl));
                        } else if(showMode == '2') {
                            $uploadList.html(getUploadPreviewItem2(res.data, index, isShowUrl));
                        } else {
                            $uploadList.html(getUploadItem(res.data, index, isShowUrl));
                        }
                    } else {
                        // 正常添加
                        if(showMode == '1') {
                            $uploadList.append(getUploadPreviewItem(res.data, index, isShowUrl));
                        } else {
                            $uploadList.append(getUploadItem(res.data, index, isShowUrl));
                        }
                    }

                } else {
                    Dialog.errorDialog(res.errorMessage);
                }
            },
            error: _config.error || function(res){

            },
            progress: _config.progress || function(n){

            }
        };

        if (device.ie && device.ie < 10) {
            config.url = getUploadUrl();
            config.before = _config.before || function() {
                if(!_config.replace) {
                    // 文件个数限制
                    var $uploadWrapper = _config.elem.parent().parent().parent(),
                        $uploadItems = $uploadWrapper.find('.upload-file-item');

                    if($uploadItems.length >= parseInt(this.maxNum)) {
                        Dialog.errorDialog('最多上传'+ this.maxNum +'个文件');
                        return false;
                    }
                    return true;
                } else {
                    return true;
                }

            };
            config.done = _config.done || function (res) {
                if(res.success) {
                    var $curUploadBtn = this.elem,
                        index = $curUploadBtn.attr('data-index'),
                        isShowUrl = $curUploadBtn.attr('data-show-url'),
                        showMode = $curUploadBtn.attr('data-show-mode'),            // default:文件展示 1: 图片预览方式 2: 图片预览方式2（身份证类型）
                        $uploadBox = $curUploadBtn.parents('.upload-box'),
                        $uploadWrapper = $uploadBox.parent('.upload-wrapper'),
                        // $uploadList = $uploadBox.next('.upload-list');
                        $uploadList = $uploadWrapper.find('.upload-list');

                    if(_config.replace) {
                        if(showMode == '1') {
                            $uploadList.html(getUploadPreviewItem(res.data, index, isShowUrl));
                        } else if(showMode == '2') {
                            $uploadList.html(getUploadPreviewItem2(res.data, index, isShowUrl));
                        } else {
                            $uploadList.html(getUploadItem(res.data, index, isShowUrl));
                        }
                    } else {
                        if(showMode == '1') {
                            $uploadList.append(getUploadPreviewItem(res.data, index, isShowUrl));
                        } else {
                            $uploadList.append(getUploadItem(res.data, index, isShowUrl));
                        }
                    }
                } else {
                    Dialog.errorDialog(res.errorMessage);
                }
            }
        }
        return config;
    }

    function initUpload(_config) {
        return upload.render(getConfig(_config));
    }

    $(document).on('click', '.upload-file-remove', function() {
        var $o = $(this);

        // if (device.ie && device.ie < 10) {}
        var $curUploadWrapper = $o.parents('.upload-wrapper'),
            $curFileInput = $curUploadWrapper.find('.layui-upload-file');
        $curFileInput.val('');

        $o.parent().remove();
    });

    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('MUpload', initUpload);
});