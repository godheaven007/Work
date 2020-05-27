/**
 * 服务-专题
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Pager', 'Common','upload', 'MUpload', 'Editor', 'CommonEditor'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        device = layui.device(),
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Editor = layui.Editor;
    var CommonEditor = layui.CommonEditor;
    var Dialog = layui.Dialog;
    var Pager = layui.Pager;
    var MUpload = layui.MUpload;

    var editor;
    var productTempList = [];       // 专题商品临时列表
    var pager;


    function getSplitParam() {
        var param = {
            keyword: $('input[name=keyword]').val(),
            limit: $('.ajaxpageselect option:selected').val() || 10,
            type: $('select[name=type] option:selected').val(),
            cate: $('select[name=cate] option:selected').val(),
            page: $('.inputpage').val() || 1
        };

        return param;
    }

    function initPager() {
        var pageAjaxUrl = $('#searchUrl').val();
        Pager.initPager({
            type: 2,
            url: pageAjaxUrl,
            callback: getSplitParam,
            target: $('.tableAjax'),
            renderForm: function() {
                $('#selectAll').prop('checked', false);
                matchAddedProduct($('input.selectcheckbox'), $('#selectAll'));
                form.render();
            }
        });
    }

    /**
     * 选择服务产品（勾选后数据变更）
     * @param data
     * @param type
     */
    function isDuplicateData(item) {
        var flag = false;       // flag:true 重复
        for(var i = 0, len = productTempList.length; i < len; i++) {
            if(item.value == productTempList[i].value) {
                flag = true;
                break;
            }
        }
        return flag;
    }

    function removeData(item) {
        for(var i = 0, len = productTempList.length; i < len; i++) {
            if(item.value == productTempList[i].value) {
                productTempList.splice(i, 1);
                break;
            }
        }
    }

    function productTempListHandle(data, type) {
        if(type == 'append') {
            // 添加(重复数据无需添加)
            data.forEach(function(item) {
                if(isDuplicateData(item)) {
                    // 重复数据
                } else {
                    productTempList.push(item);
                }
            });
        } else {
            // 移除
            data.forEach(function(item) {
                removeData(item);
            });
        }
    }

    // 匹配当前页是否有已添加的产品
    function matchAddedProduct($singleBoxes, $allBox) {
        var size = $singleBoxes.length,
            num = 0;
        $singleBoxes.each(function(i, o) {
            var $curBox = $(o);
            var value = $curBox.val();

            for(var i = 0, len = productTempList.length; i < len; i++) {
                if(value == productTempList[i].value) {
                    $curBox.prop('checked', 'checked');
                    num += 1;
                    break;
                }
            }
        });
        if((size == num) && (num != 0)) {
            // 全选选中
            $allBox.prop('checked', 'checked');
        }
        form.render(null, 'formDialog');
    }

    function setProductHtml(list) {
        var _html = '<table class="layui-table table-fixed mb-15">' +
                        '<colgroup>' +
                            '<col width="">' +
                            '<col width="30%">' +
                            '<col width="16%">' +
                            '<col width="14%">' +
                        '</colgroup>' +
                        '<thead>' +
                            '<tr>' +
                                '<td class="txt-c">服务产品</td>' +
                                '<td class="txt-c">服务分类</td>' +
                                '<td class="txt-c">排序</td>' +
                                '<td class="txt-c">操作</td>' +
                            '</tr>' +
                        '</thead>' +
                        '<tbody class="product-list">';
        for(var i = 0, len = list.length; i < len; i++) {
            _html +='<tr data-value="'+ list[i].value +'" data-prod-name="'+ list[i].prodName +'" ' +
                        'data-cate-name="'+ list[i].cateName +'" data-type-name="'+ list[i].typeName +'" ' +
                        'data-price="'+ list[i].price +'" data-intro="'+ list[i].intro +'">' +
                        '<td>' +
                            '<div class="layui-col-xs9 txt-ellipsis">' +
                                '<span title="'+ list[i].prodName +'">'+ list[i].prodName +'</span><br>' +
                                '<span class="c-gray-light" title="'+ list[i].intro +'">'+ list[i].intro +'</span>' +
                                '<input type="hidden" name="prodId[]" value="'+ list[i].value +'">' +
                            '</div>' +
                            '<div class="layui-col-xs3 mt-10 txt-r price">';
            if(list[i].price == '未定') {
                _html += '<span class="c-red">'+ list[i].price +'</span>';
            } else if(list[i].price.indexOf('¥') != -1) {
                _html += '<span class="c-red">'+ list[i].price +'</span>';
            }else {
                _html += '<span class="c-red">¥'+ list[i].price +'</span>';
            }
            _html +=
                            '</div>' +
                        '</td>' +
                        '<td class="txt-c">'+ list[i].cateName +'</td>' +
                        '<td><input type="text" name="sortNo[]" class="layui-input sortNo" placeholder="" value="'+ list[i].order +'" lay-verify="required|only1to255" autocomplete="off"></td>' +
                        '<td class="txt-c"><a href="#" class="c-link productDel">删除</a></td>' +
                    '</tr>';
        }
        _html +=
                        '</tbody>' +
                '</table>';

        if(!productTempList.length) {
            $('.productDiv').html('');
        } else {
            $('.productDiv').html(_html);
        }
    }

    function renderTopicHandle(html) {
        Dialog.confirmDialog({
            title: '选择服务产品',
            content: html,
            area: ['900px', '670px'],
            success: function(layero, index) {
                form.render(null, 'formDialog');
                initPager();

                // 匹配当前页是否有已添加的产品
                matchAddedProduct(layero.find('input.selectcheckbox'), layero.find('#selectAll'));

                // 全选
                form.on('checkbox(layTableAllChoose)', function (data) {
                    var $boxes = layero.find('.selectcheckbox'),
                        isChecked = data.elem.checked;

                    if(isChecked) {
                        $boxes.prop('checked', true);
                    } else {
                        $boxes.prop('checked', false);
                    }
                    form.render();
                });

                // 单选
                form.on('checkbox(layTableChoose)', function (data) {
                    var elem = data.elem,
                        isChecked = data.elem.checked,
                        $elem = $(elem);

                    var allSize = layero.find('.selectcheckbox').length,
                        selectedSize = layero.find('.selectcheckbox:checked').length;

                    if(selectedSize == allSize) {
                        $('#selectAll').prop('checked', true);
                    } else {
                        $('#selectAll').prop('checked', false);
                    }

                    var tempObj = {};
                    tempObj.value = data.value;
                    tempObj.prodName = $elem.attr('data-prod-name');
                    tempObj.cateName = $elem.attr('data-cate-name');
                    tempObj.typeName = $elem.attr('data-type-name');
                    tempObj.price = $elem.attr('data-price');
                    tempObj.intro = $elem.attr('data-intro');
                    tempObj.order = 255;

                    if(isChecked) {
                        productTempListHandle([tempObj], 'append');
                    } else {
                        productTempListHandle([tempObj], 'remove');
                    }

                    form.render();
                });

                layero.find('#search2').click(function () {
                    var param  = getSplitParam();
                    Pager.renderPager(param, function () {
                        form.render(null, 'formDialog');
                    });
                });
                layero.find('input[name=keyword]').keydown(function (e) {
                    if (e.keyCode == 13) {
                        $('#search2').trigger('click');
                    }
                });

                // 服务类型
                form.on('select(type)', function () {
                    var param  = getSplitParam();
                    Pager.renderPager(param, function () {
                        form.render(null, 'formDialog');
                    });
                });
                // 服务分类
                form.on('select(cate)', function () {
                    var param  = getSplitParam();
                    Pager.renderPager(param, function () {
                        form.render(null, 'formDialog');
                    });
                });
            },
            yesFn: function (index, layero) {
                setProductHtml(productTempList);
                productTempList = [];
                layer.close(index)
            }
        })
    }

    function renderTopic(url) {
        Req.getReq(url, function (res) {
            renderTopicHandle(res);
        }, 'html')
    }

    $(function() {
        editor = CommonEditor.initEditor();
        var $uploads = $('.upload1');
        $uploads.each(function (i, o) {
            MUpload({
                iframeIndex: i,
                elem: $(o),
                exts: 'jpg|jpeg|png',
                maxNum: 1,
                size: 1024 * 1,
                replace: true,
                filePolicy: 'web'
            });
        });

        // 专题产品
        $(document).on('click', '.selectProduct', function() {
            var url = $(this).attr('data-url');
            var $listTr = $('.product-list tr');
            var arr = [];

            $listTr.each(function(i, o) {
                var $o = $(o),
                    tempObj = {};
                tempObj.value = $o.attr('data-value');
                tempObj.prodName = $o.attr('data-prod-name');
                tempObj.cateName = $o.attr('data-cate-name');
                tempObj.typeName = $o.attr('data-type-name');
                tempObj.price = $o.attr('data-price');
                tempObj.intro = $o.attr('data-intro');
                tempObj.order = $o.find('.sortNo').val();
                arr.push(tempObj);
            });
            productTempList = [];
            $.extend(true, productTempList, arr);
            renderTopic(url);
        });

        // 删除专题产品
        $(document).on('click', '.productDel', function() {
            var length = $('.product-list').find('tr').length;
            if(length == 1) {
                Dialog.errorDialog('服务产品至少要保留一行');
                return false;
            }
            $(this).parents('tr').remove();
        });

        form.on('submit(doSubmit)', function (data) {
            var elem = data.elem,
                url = $(elem).attr('data-url');
            var $form = $('form');
            var param = $form.serializeArray();

            if(!$('.upload-list .upload-file-item').length) {
                Dialog.errorDialog('请上传专题图片');
                return false;
            }

            // 验证编辑器内容
            var html = editor.$txt.html();
            html = html.replace(/<p><br><\/p>/g, '');
            if(html == '') {
                Dialog.errorDialog('正文不能为空');
                return false;
            }

            if($.trim($('.productDiv').html()) == '') {
                Dialog.errorDialog('请添加专题商品');
                return false;
            }

            // param.push({name:'editor', value: editor.$txt.html()});
            param.push({name:'editor', value: CommonEditor.filterInvalidBrTag()});

            Req.postReqCommon(url, param);

            return false;
        });
    });
});