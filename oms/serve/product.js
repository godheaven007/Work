/**
 * 服务-新增服务产品
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common','upload', 'MUpload', 'Editor', 'CommonEditor', 'ATree2', 'Regex'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        ATree2 = layui.ATree2,
        device = layui.device(),
        element = layui.element;
    var Common = layui.Common;
    var Req = layui.Req;
    var Editor = layui.Editor;
    var Regex = layui.Regex;
    var CommonEditor = layui.CommonEditor;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;
    var regionList,        // 区域数据
        projectList;       // 项目数据
    var editor;

    // 动态加载滚动条样式
    layui.link('http://oms.'+ Common.Util.getRootDomain() +'/assets/css/third/areatree.css');

    // 获取区域数据
    function getRegionData() {
        var url = $('#regionList').val();
        Req.getReq(url, function (res) {
            if(res.status) {
                regionList = res.data.regionList;
            } else {
                Dialog.errorDialog(res.msg);
            }
        });
    }

    // 获取项目数据
    function getProjectList() {
        var url = $('#projectList').val();
        Req.getReq(url, function (res) {
            if(res.status) {
                projectList = res.data.projectList;
            } else {
                Dialog.errorDialog(res.msg);
            }
        });
    }

    // 二级服务分类
    function renderSubCategory(list) {
        var $subparentId = $('#subparentId');
        var _opts = '<option value="">请选择</option>';

        list.forEach(function (item, index) {
            _opts += '<option value="'+ item.classifyId +'">'+ item.classifyName +'</option>';
        });
        $subparentId.html(_opts);
        form.render();
    }

    // 二级服务分类数据获取
    function subCategoryHandle(parentId) {
        var url = $('#getTwoCategoryList').val();
        url = url + '?id=' + parentId;
        Req.getReq(url, function (res) {
            if(res.status) {
                renderSubCategory(res.data.twoLevelList);
            } else {
                Dialog.errorDialog(res.msg);
            }
        });
    }

    // 服务商opts获取
    function getServiceOpts() {
        var _opts = '<option value="">请选择服务商</option>';

        if(servicelist && servicelist.length) {
            servicelist.forEach(function (item, index) {
                _opts += '<option value="'+ item.id +'">'+ item.name +'</option>';
            });
        }

        return _opts;
    }

    // 单位opts
    function getUnitOpts() {
        var _opts = '<option value="">请选择单位（可选）</option>';
        if(unitList && unitList.length) {
            unitList.forEach(function(item) {
                _opts += '<option value="'+ item.codeValue +'">'+ item.codeKey +'</option>';
            });
        }

        return _opts;
    }

    // 服务商opts
    function loadServiceList(_id) {
        var url = $('#serviceList').val();
        url = url + '?id=' + _id;
        Req.getReq(url, function (res) {
            if(res.status) {
                servicelist = res.data.data;
                $('select[name^="providerId"]').html(getServiceOpts());
                form.render();
            } else {
                Dialog.errorDialog(res.msg);
            }
        });
    }

    function updateSpecificationNo() {
        var $specificationList = $('.specification-list');

        $specificationList.each(function(i,o) {
            $(o).find('.num').text(parseInt(i) + 1);
        });
    }

    // 规格数据整理
    function getPriceData($priceLists) {
        var res = [];
        var serviceType = $('input[name=serveType]:checked').val();

        var flag = true;
        if(serviceType == '2' || serviceType == '3') {
            // 议价类服务、需求类服务
            flag = false;
        }
        $priceLists.each(function(i, o) {
            var $o = $(o),
                tempObj = {};
            tempObj.targetIds = $o.find('input[name^="targetIds"]').val().split(',');
            tempObj.servePrice = flag ? $o.find('input[name^="servePrice"]').val() : $o.find('.noprice').val();
            tempObj.priceUnit = $o.find('select[name^="priceUnit"] option:selected').val();
            res.push(tempObj);
        });

        return res;
    }

    function getProductData() {
        var $specificationLists = $('.specification-list'),
            result = [];

        $specificationLists.each(function(i, o) {
            var $o = $(o),
                $priceLists = $o.find('tbody tr'),
                tempObj = {};
            tempObj.specName = $o.find('input[name^="specName"]').val();
            tempObj.specDescribe = $o.find('input[name^="specDescribe"]').val();
            tempObj.providerId = $o.find('select[name^="providerId"] option:selected').val();
            // 此处数据应为一维数组，后台已处理
            tempObj.priceReqs = [];
            tempObj.priceReqs.push(getPriceData($priceLists));
            result.push(tempObj);
        });

        return JSON.stringify(result);
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

        // 数据初始化
        getRegionData();
        getProjectList();

        // 添加产品价格
        $(document).on('click', '.addRow', function() {
            var $curPriceList = $(this).parents('tbody'),
                serviceType = $('input[name=serveType]:checked').val();

            var _html = '<tr>' +
                            '<td>产品价格</td>' +
                            '<td>';
            if(serviceType == '1') {
                // 标准服务
                _html += '<input type="text" name="servePrice[]" class="layui-input yesprice" placeholder="填写服务单价" lay-verify="servePrice" autocomplete="off">\n' +
                    '<input type="text" name="noprice" class="layui-input noprice hidden" maxlength="50" placeholder="如“5-10万”或者“5万起”" lay-verify="noprice">';
            } else {
                // 议价类服务、需求类服务
                _html += '<input type="text" name="servePrice[]" class="layui-input yesprice hidden" placeholder="填写服务单价" lay-verify="servePrice" autocomplete="off">\n' +
                    '<input type="text" name="noprice" class="layui-input noprice" maxlength="50" placeholder="如“5-10万”或者“5万起”" lay-verify="noprice">';
            }
            _html +=
                            '</td>' +
                            '<td>' +
                                '<select name="priceUnit[]" lay-filter="priceUnit" lay-search="">' +
                                    getUnitOpts() +
                                '</select>' +
                            '</td>' +
                            '<td>' +
                                '<input type="text" name="selectArea" class="layui-input selectArea" placeholder="请选择地区" lay-verify="required" autocomplete="off" readonly="">' +
                                '<input type="hidden" name="targetIds[]" class="areaIds">' +
                            '</td>' +
                            '<td class="txt-r">' +
                                '<a href="javascript:;" class="c-link addRow">增加</a>' +
                                '<a href="javascript:;" class="c-link delRow">删除</a>' +
                            '</td>' +
                        '</tr>';
            $curPriceList.append(_html);
            form.render();
        });

        // 添加产品规格
        $(document).on('click', '.addProduct', function() {
            var size = $('.specification-list').length;
            var $last = $('.specification-list').eq(size - 1);
            var serviceType = $('input[name=serveType]:checked').val();

            var _html = '<table class="layui-table table-fixed table-border-2 mb-15  specification-list">' +
                            '<colgroup>' +
                                '<col width="12%">' +
                                '<col width="20%">' +
                                '<col width="20%">' +
                                '<col width="">' +
                                '<col width="12%">' +
                            '</colgroup>' +
                            '<thead>' +
                                '<tr>' +
                                    '<th class="font-b">规格<span class="num">'+ (size + 1) +'</span></th>' +
                                    '<th><input type="text" name="specName[]" class="layui-input" placeholder="填写规格名称" lay-verify="required|min2" maxlength="80" autocomplete="off"></th>' +
                                    '<th class="providerSelect">' +
                                        '<select name="providerId[]" lay-filter="providerId" lay-search="">' +
                                            getServiceOpts() +
                                        '</select>' +
                                    '</th>' +
                                    '<th><input type="text" name="specDescribe[]" class="layui-input" placeholder="填写此规格的描述说明" lay-verify="required|min2" maxlength="80" autocomplete="off"></th>' +
                                    '<th class="txt-r">' +
                                        '<a href="javascript:;" class="c-link delSpecification">删除</a>' +
                                    '</th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                                '<tr>' +
                                    '<td>产品价格</td>' +
                                    '<td>';
            if(serviceType == '1') {
                // 标准服务
                _html += '<input type="text" name="servePrice[]" class="layui-input yesprice" placeholder="填写服务单价" lay-verify="servePrice" autocomplete="off">\n' +
                    '<input type="text" name="noprice" class="layui-input noprice hidden" maxlength="50" placeholder="如“5-10万”或者“5万起”" lay-verify="noprice">';
            } else {
                // 议价类服务、需求类服务
                _html += '<input type="text" name="servePrice[]" class="layui-input yesprice hidden" placeholder="填写服务单价" lay-verify="servePrice" autocomplete="off">\n' +
                    '<input type="text" name="noprice" class="layui-input noprice" maxlength="50" placeholder="如“5-10万”或者“5万起”" lay-verify="noprice">';
            }
            _html +=
                                    '</td>' +
                                    '<td>' +
                                        '<select name="priceUnit[]" lay-filter="priceUnit" lay-search="">' +
                                            getUnitOpts() +
                                        '</select>' +
                                    '</td>' +
                                    '<td>' +
                                        '<input type="text" name="selectArea" class="layui-input selectArea" placeholder="请选择地区" lay-verify="required" autocomplete="off" readonly="">' +
                                        '<input type="hidden" name="targetIds[]" class="areaIds">' +
                                    '</td>' +
                                    '<td class="txt-r">' +
                                        '<a href="javascript:;" class="c-link addRow">增加</a>' +
                                        '<a href="javascript:;" class="c-link delRow">删除</a>' +
                                    '</td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>';
            $last.after(_html);
            form.render();
        });

        // 删除产品价格
        $(document).on('click', '.delRow', function() {
            var $curSpecificationList = $(this).parents('.specification-list'),
                priceListSize = $curSpecificationList.find('tbody tr').length,
                $curPriceList = $(this).parents('tr');

            if(priceListSize == 1) {
                Dialog.errorDialog('产品价格至少要保留一行');
                return false;
            }
            $curPriceList.remove();
        });

        // 删除产品规格
        $(document).on('click', '.delSpecification', function() {
            var $curSpecificationList = $(this).parents('.specification-list'),
                priceListSize = $('.specification-list').length;

            if(priceListSize == 1) {
                Dialog.errorDialog('产品规格至少要保留一行');
                return false;
            }
            $curSpecificationList.remove();
            updateSpecificationNo();
        });

        // 选择地区
        $(document).on('click', '.selectArea', function() {
            var $target = $(this),
                $next = $target.next();

            if(!regionList || !projectList) {
                return false;
            }
            var areaTree,
                areaIds = $next.val();

            if(!!areaIds) {
                // 已添加
                ATree2({
                    callback: function(instance) {
                        $target.val(instance.areaNameArr.join('、'));
                        $target.attr('title', instance.areaNameArr.join('、'));
                        $next.val(instance.areaIdArr.join(','));
                        $target.focus();
                        $target.blur();
                        instance.removeEventListener();
                        instance.$tree.remove();
                    },
                    data: {
                        region: regionList,
                        project: projectList
                    },
                    edit: areaIds.split(',')
                });
            } else {
                // 未添加
                ATree2({
                    callback: function(instance) {
                        $target.val(instance.areaNameArr.join('、'));
                        $target.attr('title', instance.areaNameArr.join('、'));
                        $next.val(instance.areaIdArr.join(','));
                        $target.focus();
                        $target.blur();
                        instance.removeEventListener();
                        instance.$tree.remove();
                    },
                    data: {
                        region: regionList,
                        project: projectList
                    },
                });
            }
        });

        // 服务类型
        form.on('radio(serveType)', function (data) {
            if(data.value == 1) {
                // 标准服务
                $('.yesprice').removeClass('hidden');
                $('.noprice').addClass('hidden');
                $('.noprice').val('');
            } else {
                // 议价类服务、需求类服务
                $('.yesprice').addClass('hidden');
                $('.noprice').removeClass('hidden');
                $('.yesprice').val('');
            }
        });

        // 服务分类
        form.on('select(parentId)', function (data) {
            loadServiceList(data.value);
            subCategoryHandle(data.value);
        });

        // 删除产品
        $(document).on('click', '.ajaxDelProduct', function() {
            var url = $(this).attr('data-url');
            Dialog.confirmDialog({
                title: '提示',
                content: '你确认要删除此产品吗？',
                yesFn: function (index, layero) {
                    Req.getReqCommon(url);
                }
            });
        });

        // 复制小程序链接
        $(document).on('click', '.ajaxCopyLink', function() {
            var url = $(this).attr('data-url');
            // 监听浏览器copy事件
            document.addEventListener('copy', function(e) {
                e.preventDefault();
                e.clipboardData.setData('text/plain', url); // 剪贴板内容设置
            });
            // 执行copy事件，执行save函数
            document.execCommand('copy');
            Dialog.successDialog('复制成功');
        });

        // 验证
        form.verify({
            // 产品价格
            servePrice: function(value, item) {
                if($(item).is(":visible")) {
                    if(!Regex.onlyDecmal8.reg.test(value)) {
                        return Regex.onlyDecmal8.msg;
                    }
                }
            },
            noprice: function (value, item) {
                if($(item).is(":visible")) {
                    if(!/[\S]+/.test(value)) {
                        return '必填，2-50个字';
                    }

                    if(value.length < 2) {
                        return '必填，2-50个字';
                    }
                }
            },
            min2: function (value, item) {
                if($(item).is(":visible")) {
                    if(value.length < 2) {
                        return '必填，2-80个字';
                    }
                }
            }
        });


        form.on('submit(doSubmit)', function (data) {
            var elem = data.elem,
                url = $(elem).attr('data-url');
            var $form = $('form');
            var param = $form.serializeArray();

            var $fileIdCoverInput = $('input[name^=fileIdcover]'),
                $fileIdMap = $('input[name^=fileIdmap]');

            if(!$fileIdCoverInput.length || ($fileIdCoverInput.length && !$fileIdCoverInput.val())) {
                Dialog.errorDialog('请上传产品封面');
                return false;
            }

            if(!$fileIdMap.length || ($fileIdMap.length && !$fileIdMap.val())) {
                Dialog.errorDialog('请上传产品图');
                return false;
            }

            var $serveName = $('input[name=serveName]'),
                $serveIntro = $('input[name=serveIntro]');

            var serveName = $.trim($serveName.val()),
                serveIntro = $.trim($serveIntro.val());

            if(serveName.length < 2) {
                Dialog.errorDialog("服务名称必填, 2-50个字");
                return false;
            }

            if(serveIntro.length < 2) {
                Dialog.errorDialog("服务简介必填, 2-80个字");
                return false;
            }


            // // 验证编辑器内容
            // var html = editor.$txt.html();
            // html = html.replace(/<p><br><\/p>/g, '');
            // if(html == '') {
            //     Dialog.errorDialog('正文不能为空!');
            //     return false;
            // }

            param.push({name: 'product', value: getProductData()});
            // param.push({name:'editor', value: editor.$txt.html()});
            param.push({name:'editor', value: CommonEditor.filterInvalidBrTag()});

            Req.postReqCommon(url, param);

            return false;
        });
    });
});