/**
 * 客户管理-详情
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'Common', 'Regex', 'Pager2', 'laydate','upload', 'MUpload', 'DateRangeUtil', 'Cropper'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        device = layui.device(),
        element = layui.element;
    var Common = layui.Common;
    var DateRangeUtil = layui.DateRangeUtil;
    var Pager2 = layui.Pager2;
    var Req = layui.Req;
    var Regex = layui.Regex;
    var Dialog = layui.Dialog;
    var MUpload = layui.MUpload;

    var loadParkList = false,
        loadLogList = false;


    var $activeRadio = null;
    var pager = null,
        pager2 = null;

    // 获取分页参数
    function getSplitParam(index) {
        var param = {
            limit: $('.ajaxpageselect').eq(index).find('option:selected').val() || 10,
            page: $('.inputpage').eq(index).val() || 1
        };

        return param;
    }

    // function renderParkPager() {
    //     var pageAjaxUrl = $('.parkAjax').attr('data-url');
    //     Pager.initPager({
    //         type: 2,
    //         url: pageAjaxUrl,
    //         callback: getSplitParam,
    //         target: $('.parkAjax')
    //     });
    // }

    function renderLogPager() {
        var pageAjaxUrl = $('#pageAjaxUrl').val();

        pager = Pager2({
            type: 1,
            url: pageAjaxUrl,
            callback: getSplitParam,
            pageContainer: $('.logAjax').find('.ajaxTableTbody'),
            pageBar: $('.logAjax').find('.ajaxTablePage')
        });
    }

    function loadItem($o, url) {
        Req.getReq(url, function (res) {
            if(res.status) {
                $o.html(res.data.listContent);
                $o.find('.loading').hide();
                // if($o.hasClass('parkAjax')) {
                //     renderParkPager();
                // }
            } else {
                // 区块不显示
                $o.hide();
            }
        });
    }

    // 异步加载首页各模块
    function loadModules() {
        var $modules = $('.ajaxLoad');
        $modules.each(function (i, o) {
            var $o = $(o),
                url = $o.attr('data-url');
            loadItem($o, url);
        });
    }

    // 添加\编辑联系人
    function getContractDialogHtml(param) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-40">姓名</label>' +
                                '<div class="layui-input-block" style="margin-left: 80px">' +
                                    '<input type="text" name="name" value="'+ param.name +'" maxlength="4"  lay-reqText="请输入联系人姓名" lay-verify="required" placeholder="请输入联系人姓名" autocomplete="off" class="layui-input">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-40">职务</label>' +
                                '<div class="layui-input-block" style="margin-left: 80px">' +
                                    '<input type="text" name="job" value="'+ param.job +'" maxlength="10"  lay-reqText="请输入联系人职务" placeholder="请输入联系人职务" autocomplete="off" class="layui-input">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-40">手机</label>' +
                                '<div class="layui-input-block" style="margin-left: 80px">' +
                                    '<input type="text" name="phone" value="'+ param.phone +'"  lay-reqText="请输入联系人手机号码" lay-verify="required|phone" placeholder="请输入联系人手机号码" autocomplete="off" class="layui-input">'+
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function getParkNumOpts() {
        var opts = '<option value="">请选择</option>';
        var arr = [];
        for(var i = 1; i <= 15; i++) {
            arr.push(i);
        }

        arr.forEach(function (v, k) {
            opts += '<option value="'+ v +'">'+ v +'</option>';
        });
        return opts;
    }

    function getParkDialogHtml(name) {
        var _html = '<div class="layui-card-body" style="height: 350px; overflow-y: scroll;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-100">客户名称</label>' +
                                '<div class="layui-input-block" style="margin-left: 130px;">' +
                                    '<div class="layui-form-mid">'+ name +'</div>' +
                                '</div>' +
                                '<input type="hidden" name="name" value="'+ name +'">' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>添加数量</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<select name="num" lay-verify="required" lay-filter="num">' +
                                        getParkNumOpts() +
                                    '</select>' +
                                '</div>' +
                                '<div class="layui-form-mid">个园区</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>到期时间</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="endDate" value="" lay-verify="required|date" placeholder="yyyy-MM-dd"  lay-reqText="请填写到期时间" autocomplete="off" class="layui-input datebox">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-100">备注</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<textarea placeholder="请填写备注" maxlength="500" class="layui-textarea" name="remark" id="remark"></textarea>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item">' +
                                '<label class="layui-form-label text-w-100">相关凭证</label>' +
                                '<div class="layui-input-inline" style="width: 300px;">' +
                                    '<div class="upload-wrapper">' +
                                        '<div class="upload-box">' +
                                            '<button type="button" class="layui-btn upload"><i class="layui-icon"></i>上传</button><input class="layui-upload-file" type="file" accept="" name="file">' +
                                            '<div class="upload-list"></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 日志
    function getLogDialogHtml(data) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">';

        if(data.optType == '1') {
            _html += '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100">客户名称</label>' +
                        '<div class="layui-form-mid">'+ data.custName +'</div>' +
                    '</div>' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100">添加数量</label>' +
                        '<div class="layui-form-mid">'+ data.addNum +'个园区</div>' +
                    '</div>' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100">到期时间</label>' +
                        '<div class="layui-form-mid">'+ data.newExpireDate +'</div>' +
                    '</div>';
        } else {
            _html += '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100">园区名称</label>' +
                        '<div class="layui-form-mid">'+ data.parkName +'</div>' +
                    '</div>' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100">原到期时间</label>' +
                        '<div class="layui-form-mid">'+ data.oldExpireDate +'</div>' +
                    '</div>' +
                    '<div class="layui-form-item label-l">' +
                        '<label class="layui-form-label text-w-100">续期至</label>' +
                        '<div class="layui-form-mid">'+ data.newExpireDate +'</div>' +
                    '</div>' ;
        }
        _html += '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">备注</label>' +
                                '<div class="layui-form-mid">'+ data.remark +'</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">相关凭证</label>' +
                                '<div class="layui-input-inline" style="width: 300px;">' +
                                    '<div class="upload-list">';
                        if(data.attList && data.attList.length) {
                            data.attList.forEach(function (item, index) {
                                _html += '<div class="upload-file-item"><i class="file-icon '+ item.attFileType +'"></i><a class="upload-file-name" href="'+ item.attUrl +'" target="_blank">'+ item.attName +'</a></div>';
                            });

                        }
                        _html += '</div>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 续期
    function getRenewalDialogHtml(parkName, endDate) {
        var _html = '<div class="layui-card-body" style="height: 350px; overflow-y: scroll;">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">园区名称</label>' +
                                '<div class="layui-form-mid">'+ parkName +'</div>' +
                                '<input type="hidden" name="parkName" value="'+ parkName +'">' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">原到期时间</label>' +
                                '<div class="layui-form-mid">'+ endDate +'</div>' +
                                '<input type="hidden" name="endDate" value="'+ endDate +'">' +
                            '</div>' +
                            '<div class="layui-form-item label-l" style="margin-bottom: 5px;">' +
                                '<label class="layui-form-label text-w-100"><span class="c-orange">* </span>续期至</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<input type="text" name="renewalDate" lay-verify="required|date"  lay-reqText="请填写续期日期" required placeholder="yyyy-MM-dd" autocomplete="off" class="layui-input datebox">'+
                                '</div>' +
                            '</div>'+
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100"></label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<a href="javascript:;" class="c-link selectYear" data-year="1">1年</a>' +
                                    '<a href="javascript:;" class="c-link selectYear" data-year="2">2年</a>' +
                                    '<a href="javascript:;" class="c-link selectYear" data-year="3">3年</a>' +
                                    '<a href="javascript:;" class="c-link selectYear" data-year="4">4年</a>' +
                                    '<a href="javascript:;" class="c-link selectYear" data-year="5">5年</a>' +
                                '</div>' +
                            '</div>'+
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">备注</label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<textarea placeholder="请填写备注" maxlength="500" class="layui-textarea" name="remark" id="remark"></textarea>' +
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-100">相关凭证</label>' +
                                '<div class="layui-input-inline" style="width: 300px;">' +
                                    '<div class="upload-wrapper">' +
                                        '<div class="upload-box">' +
                                            '<button type="button" class="layui-btn upload"><i class="layui-icon"></i>上传</button><input class="layui-upload-file" type="file" accept="" name="file">' +
                                        // '<div class="describe" style="margin-left: 5px;">单个文件不超过2M，最多可上传1个</div>' +
                                        '</div>' +
                                        '<div class="upload-list"></div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function replaceUrlParam(url, paramName,replaceWith) {
        var oUrl = url;
        var tempParamName = paramName + '=';
        var newUrl = '';
        if(oUrl.indexOf(tempParamName) != -1) {
            var re = eval('/('+ paramName+'=)([^&]*)/gi');
            var newUrl = oUrl.replace(re, paramName + '=' + replaceWith);
        } else {
            if(oUrl.indexOf('?') != -1) {
                newUrl = oUrl + '&' + paramName + '=' + replaceWith;
            } else {
                newUrl = oUrl + '?' + paramName + '=' + replaceWith;
            }
        }

        return newUrl;
    }

    // 获取当前日期的下一天
    function getNextDay() {
        var timeStamp = new Date().getTime();
        var nextDayTimeStamp = timeStamp + 24 * 60 * 60 * 1000;
        var date = new Date(nextDayTimeStamp);
        var year = date.getFullYear(),
            month = parseInt(date.getMonth()) + 1,
            day = date.getDate();

        if(month < 10) {
            month = '0' + month;
        }

        return year + '-' + month + '-' + day;
    }

    $(function() {
        renderLogPager();
        loadModules();
        $activeRadio = $('input[name=versions]:checked');

        form.on('radio(versions)', function (data) {
            var type = data.value;          // 1: 公共版   2:私有版
            var msg = type == '1' ? '公共版' : '私有版';
            $('.versions').prop('checked', false);
            $activeRadio.prop('checked', true);
            form.render();

            Dialog.confirmDialog({
                title: '提示',
                content: '确定要将小程序版本调整为【'+ msg +'】吗？',
                yesFn: function (index, layero) {
                    var url = $('input[name=changeMinTypeAjaxUrl]').val();
                    url = replaceUrlParam(url, 'miniType', type);
                    Req.getReq(url, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                $('input[name=versions][value='+ type +']').prop('checked', true);
                                $activeRadio = $('input[name=versions][value='+ type +']');
                                form.render();
                                layer.close(index);
                                window.location.reload();
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    })
                }
            })

        });

        // 添加联系人
        $(document).on('click', '.ajaxAddLinkman', function () {
            var url = $(this).attr('data-url');
            var param = {
                phone: '',
                job: '',
                name: ''
            };
            Dialog.formDialog({
                title: '添加联系人',
                content: getContractDialogHtml(param),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    form.render(null, 'formDialog');

                    form.on('submit(bind)', function(data) {
                        var reqParam = $form.serializeArray();
                        Req.postReq(url, reqParam, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    layer.close(index);
                                    window.location.reload();
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    });
                }
            })
        });

        // 编辑联系人
        $(document).on('click', '.ajaxEditLinkman', function () {
           var $o = $(this),
               url = $o.attr('data-url'),
               phone = $o.attr('data-phone-num'),
               job = $o.attr('data-job-name'),
               name = $o.attr('data-name');

           var param = {
               phone: phone,
               job: job,
               name: name
           };

           Dialog.formDialog({
                title: '编辑联系人',
                content: getContractDialogHtml(param),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    form.render(null, 'formDialog');

                    form.on('submit(bind)', function(data) {
                        var reqParam = $form.serializeArray();
                        Req.postReq(url, reqParam, function (res) {
                            if(res.status) {
                                Dialog.successDialog(res.msg, function () {
                                    layer.close(index);
                                    window.location.reload();
                                });
                            } else {
                                Dialog.errorDialog(res.msg);
                            }
                        });
                        return false;
                    });
                }
            })
        });

        // 删除联系人
        $(document).on('click', '.ajaxDelLinkman', function () {
            var url = $(this).attr('data-url'),
                name = $(this).attr('data-name');

            Dialog.delDialog({
                title: '删除联系人',
                content: '<div style="padding: 20px;">确定要删除【'+ name +'】吗？</div>',
                yesFn: function(index, layero) {
                    Req.getReq(url, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                layer.close(index);
                                window.location.reload();
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                }
            });
        });

        // 添加园区
        $(document).on('click', '.ajaxAddPark', function () {
            var url = $(this).attr('data-url'),
                name = $(this).attr('data-name');
            Dialog.formDialog({
                title: '添加园区',
                content: getParkDialogHtml(name),
                area: ['500px', 'auto'],
                success: function (layero, index) {
                    var $form = layero.find('form');
                    var $elem = layero.find('.upload');
                    form.render(null, 'formDialog');
                    MUpload({
                        elem: $elem,
                        exts: 'jpg|jpeg|png',
                        maxNum: 5,
                    });
                    laydate.render({
                        elem: layero.find('.datebox')[0],
                        min: getNextDay(),
                        trigger: 'click',
                        // showBottom: false
                        btns: ['clear', 'now']
                    });
                    form.on('submit(bind)', function(data) {
                        var param = $form.serializeArray();
                        Req.postReqCommon(url, param);
                        return false;
                    })
                },
                endFn: function () {
                    // IE浏览器上传
                    if (device.ie && device.ie < 10) {
                        $('iframe').remove();
                    }
                }
            })
        });

        // 删除园区
        $(document).on('click', '.ajaxDelPark', function () {
            var url = $(this).attr('data-url'),
                name = $(this).attr('data-name');

            Dialog.delDialog({
                title: '删除园区',
                content: '<div style="padding: 20px;">确定要删除该园区吗？</div>',
                yesFn: function(index, layero) {
                    Req.getReq(url, function (res) {
                        if(res.status) {
                            Dialog.successDialog(res.msg, function () {
                                layer.close(index);
                                window.location.reload();
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                }
            });
        });

        // 查看明细
        $(document).on('click', '.logAjax .viewlog', function () {
            var url = $('input[name=getparklogAjaxUrl]').val();
            var logId = $(this).attr('dataid');
            url = url + '?id=' + logId;

            Req.getReq(url, function (res) {
                if(res.status) {
                    var title = '添加日志';
                    if(res.data.detail.optType == '2') {
                        title = '续租日志';
                    }
                    Dialog.formDialog({
                        title: title,
                        content: getLogDialogHtml(res.data.detail),
                        area: ['500px', 'auto'],
                        btn: ['关闭'],
                        yesFn: function (index, layero) {
                            layer.close(index);
                        }
                    })
                }
            });
        });

        // 续期
        $(document).on('click', '.ajaxRenew', function () {
            var $o = $(this),
                endDate = $o.attr('data-end-date'),
                parkName = $o.attr('data-park-name'),
                url = $o.attr('data-url');
            Dialog.formDialog({
                title: '续期',
                content: getRenewalDialogHtml(parkName, endDate),
                area: ['500px', 'auto'],
                success: function (layero, index) {
                    var $form = layero.find('form');
                    var $elem = layero.find('.upload');
                    MUpload({
                        elem: $elem,
                        exts: 'jpg|jpeg|png',
                        maxNum: 5,
                    });
                    laydate.render({
                        elem: layero.find('.datebox')[0],
                        trigger: 'click',
                        // showBottom: false
                        btns: ['clear', 'now']
                    });

                    layero.find('.selectYear').click(function () {
                        var year = parseInt($(this).attr('data-year'));
                        laydate.render({
                            elem: layero.find('.datebox')[0],
                            // showBottom: false,
                            btns: ['clear', 'now'],
                            trigger: 'click',
                            value: DateRangeUtil.getAfterNYear(new Date(endDate + ''), year)
                        });
                    });

                    form.on('submit(bind)', function(data) {
                        var param = $form.serializeArray();
                        Req.postReqCommon(url, param);
                        return false;
                    })
                },
                endFn: function () {
                    // IE浏览器上传
                    if (device.ie && device.ie < 10) {
                        $('iframe').remove();
                    }
                }
            })
        });

        // 园区分页
        $(document).on('click', '.parkAjax .layui-laypage a.ajaxpage', function () {
            var url = $(this).attr('data-url');
            Req.getReq(url, function (res) {
                if(res.status) {
                    $('.parkAjax').html(res.data.listContent);
                }
            })
        })
    });
});