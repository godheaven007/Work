layui.define(function (exports) {
    var $ = layui.jquery;
    var layer = layui.layer;
    var form = layui.form;
    var Req = layui.Req;
    var Dialog = layui.Dialog;
    var Editor = layui.Editor;
    var MUpload = layui.MUpload;

    function uploadInit () {
        var minWidth = 750,               // 编辑器上传图片最小宽度
            maxWidth = 1000;              // 编辑器上传图片最大宽度

        var editor = this;
        var btnId = editor.customUploadBtnId;
        var containerId = editor.customUploadContainerId;

        setTimeout(function () {
            MUpload({
                iframeIndex: 77777,
                elem: $('#' + containerId),
                // elem: $('.wangeditor-menu-img-picture').parents('.menu-item'),
                exts: 'JPG|JPEG|PNG',
                done: function (res) {
                    $('.wangEditor-drop-panel').hide();
                    // editor.$txt.focus();
                    if(res.success) {
                        var tempImg = new Image();
                        tempImg.src = res.data.webPath;
                        tempImg.onload = function () {
                            var _w = tempImg.width;

                            // if(_w < minWidth) {
                            //     Dialog.errorDialog2({
                            //         content: "图片最小宽度不得低于" + minWidth + '像素,当前图片宽度为' + _w + '像素',
                            //         time: 3000
                            //     });
                            //     return false;
                            // }

                            if(_w > maxWidth) {
                                Dialog.errorDialog2({
                                    content: "图片最大宽度不得高于" + maxWidth + '像素,当前图片宽度为' + _w + '像素',
                                    time: 3000
                                });
                                return false;
                            }

                            editor.command(null, 'insertHtml', '<img src="'+ res.data.webPath +'" alt="'+ res.data.fileName +'">');
                            // if(_w > $('#editor').width()) {
                            //     // editor.$txt.append('<p><img class="large" src="'+ res.data.webPath +'" alt="'+ res.data.fileName +'"></p>');
                            //     // editor.command(null, 'insertHtml', '<p><img class="large" src="'+ res.data.webPath +'" alt="'+ res.data.fileName +'"></p>');
                            // } else {
                            //     // editor.$txt.append('<p><img src="'+ res.data.webPath +'" alt="'+ res.data.fileName +'"></p>');
                            //     // editor.command(null, 'insertHtml', '<p><img src="'+ res.data.webPath +'" alt="'+ res.data.fileName +'"></p>');
                            // }
                            // keepLastIndex(editor.$txt[0]);
                        }
                        // IE9
                        // $('.wangeditor-menu-img-picture').parent().removeClass('active');
                    }
                }
            });
        },10);

        // $(document).on('click', '#' + containerId, function () {
        //     $('.uploadTemp').trigger('click');
        // })
    }

    function keepLastIndex(obj) {
        if (window.getSelection) {
            obj.focus();
            var range = window.getSelection();
            range.selectAllChildren(obj);
            range.collapseToEnd();// 光标移至最后
        }
        else if (document.selection) {//ie10 9 8 7 6 5
            var range = document.selection.createRange();
            //var range = document.body.createTextRange();
            range.moveToElementText(obj);
            range.collapse(false);// 光标移至最后
            range.select();
        }
    }

    function initEditor() {
        var editor = new Editor('editor');
        // 只粘贴纯文本
        editor.config.pasteText = true;
        editor.config.menus = [
            'head',       // 标题、段落
            'img',          // 插入图片
            'fontsize',   // 字号
            '|',
            'bold',       // 粗体
            'italic',     // 斜体
            'underline',  // 下划线
            'forecolor',  // 文字颜色
            '|',    // 对齐方式
            'alignleft',
            'aligncenter',
            'alignright',
        ];
        editor.config.colors = {
            '#33312E': '黑色',
            '#FE2C22': '红色',
            '#FF9901': '橙色',
            '#FFD902': '黄色',
            '#09BB07': '绿色',
            '#328FFA': '蓝色',
            '#AA17D0': '紫色',
            '#999999': '灰色'
        };

        editor.config.hideLinkImg = true;
        editor.config.customUpload = true;            // 配置自定义上传的开关
        editor.config.customUploadInit = uploadInit;  // 配置上传事件，uploadInit方法已经在上面定义了
        editor.create();

        // editor.$txt.html('');

        if(typeof editconent != 'undefined') {
            editor.$txt.html(editconent.content);
            // editor.$txt.html(toHtml(editconent.content));
        }

        return editor;
    }

    /**
     * 转义字符
     * @param editor
     * @returns {*}
     */

    /**
     * 将str中的html符号转义,默认将转义''&<">''四个字符，可自定义reg来确定需要转义的字符
     * @name unhtml
     * var html = '<body>You say:"你好 & Oeditor!"</body>';
     * unhtml(html);   ==>  &lt;body&gt;You say:&quot;你好 &amp; Oeditor!&quot;&lt;/body&gt;
     * unhtml(html,/[<>]/g)  ==>  &lt;body&gt;You say:"你好 & Oeditor!!"&lt;/body&gt;
     * @param str
     * @param reg
     * @returns {string}
     */
    function unHtml(str, reg) {
        return str ? str.replace(reg || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp);)?/g, function(a, b) {
            if (b) {
                return a;
            } else {
                return {
                    '<': '&lt;',
                    '&': '&amp;',
                    '"': '&quot;',
                    '>': '&gt;',
                    "'": '&#39;'
                }[a]
            }

        }) : '';
    }

    /**
     * 将str中的转义字符还原成html字符
     * @name html
     * @grammar OE.utils.html(str)  => String   //详细参见<code><a href = '#unhtml'>unhtml</a></code>
     */
    function toHtml(str) {
        return str ? str.replace(/&((g|l|quo)t|amp|#39);/g, function(m) {
            return {
                '&lt;': '<',
                '&amp;': '&',
                '&quot;': '"',
                '&gt;': '>',
                '&#39;': "'"
            }[m]
        }) : '';
    }

    // 过滤无效br标签
    function filterInvalidBrTag(editor) {
        editor = !editor ? '#editor' : editor;

        var $editPTag = $(editor).children('p');

        // <p><br><img>文字</p> ==> <p><img>文字</p>
        $editPTag.each(function(i, o) {
            var $o = $(o);
            if($o.find('img').length) {
                $o.html($o.html().replace(/<br>/g, ''));
            }
            // font标签替换（小程序无法识别font标签）
            var $fontTags = $o.find('font');
            $fontTags.each(function (i, ftag) {
                var $curFontTag = $(ftag);
                $curFontTag.replaceWith('<span style="color:'+ $curFontTag.attr('color') +'">'+ $curFontTag.text() +'</span>');
            })
        });

        // 去除最后空行
        var $cloneEdit = $(editor).clone(),
            $pTags = $cloneEdit.children('p'),
            len = $pTags.length;

        for(var i = len - 1; i >= 0; i--) {
            var $curPTag = $pTags.eq(i),
                pHtml = $curPTag.prop('outerHTML');
            if(pHtml == '<p><br></p>') {
                $curPTag.remove();
            } else {
                break;
            }
        }
        return convertStr($cloneEdit.html());
    }

    function convertStr(html) {
        return html.replace(/"/gm, '&quot;').replace(/'/gm, '&#39;');
    }

    // (服务)处理编辑器内容，给小程序提供json格式
    function editorDataHandle(html) {
        // html = html.replace(/&nbsp;/g, ' ');
        var data = {
            "applet": [],
            "pc": html
        };
        html = '<div class="wrap">'+ html +'</div>';
        var $wrap = $(html),
            $children = $wrap.children();

        $children.each(function(i, o) {
            var tempObj = {};

            if($(o).find('img').length) {
                tempObj.imgSrc = $(o).find('img').attr('src');
            }
            tempObj.txt = $(o).text();
            data.applet.push(tempObj);
        });

        return JSON.stringify(data);
    }

    var Util = {
        initEditor: initEditor,
        filterInvalidBrTag: filterInvalidBrTag,
        unHtml: unHtml,
        toHtml: toHtml,
        editorDataHandle: editorDataHandle
    };

    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('CommonEditor', Util);
});