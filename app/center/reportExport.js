/**
 * 报表中心-导出
 */

layui.use(['element', 'form', 'Dialog', 'Req', 'laydate', 'Common', 'DateRangeUtil'], function() {
    var $ = layui.jquery,
        form = layui.form,
        laydate = layui.laydate,
        element = layui.element;
    var Common = layui.Common;
    var DateRangeUtil = layui.DateRangeUtil;
    var Req = layui.Req;
    var Dialog = layui.Dialog;

    function renderBeginDateBox(date) {
        lay('.beginDateBox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                // showBottom: false,
                btns: ['clear', 'now'],
                value: date
            });
        });
    }

    function renderEndDateBox(Date) {
        lay('.endDateBox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                // showBottom: false,
                btns: ['clear', 'now'],
                value: Date
            });
        });
    }

    function renderDateBox() {
        lay('.dateBox').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                btns: ['clear', 'now']
            });
        });
    }

    function renderDatebox2(startDate, endDate) {
        lay('.datebox2').each(function(){
            laydate.render({
                elem: this,
                trigger: 'click',
                range: '~',
                value: startDate + ' ~ ' + endDate
            });
        });
    }

    // 招商成交客户清单
    function getZscjkhqdDialogHtml(key) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-150">登记拟签约客户日期</label>' +
                                '<div class="layui-input-inline text-w-100">' +
                                    '<input type="text" name="proposedSignBeginDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input text-w-100 dateBox">'+
                                '</div>' +
                                '<div class="layui-form-mid">-</div>' +
                                '<div class="layui-input-inline text-w-100">' +
                                    '<input type="text" name="proposedSignEndDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input text-w-100 dateBox">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-150">签约日期</label>' +
                                '<div class="layui-input-inline text-w-100">' +
                                    '<input type="text" name="signBeginDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input beginDateBox">'+
                                '</div>' +
                                '<div class="layui-form-mid">-</div>' +
                                '<div class="layui-input-inline text-w-100">' +
                                    '<input type="text" name="signEndDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input endDateBox">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l c-gray-light" style="padding-left: 40px;">说明： 签约日期即盖章完成日期（上传合同扫描件日期）' +
                            '</div>' +
                            '<input type="hidden" name="key" value="'+ key +'">' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }


    // 退租发起记录清单
    function getTzfqjlqdexportDialogHtml(key) {
        var _html = '<div class="layui-card-body">' +
            '<form class="layui-form" action="" lay-filter="formDialog">' +
            '<div class="layui-form-item label-l">' +
            '<label class="layui-form-label text-w-120">退租申请日期</label>' +
            '<div class="layui-input-inline text-w-100">' +
            '<input type="text" name="beginDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input beginDateBox">'+
            '</div>' +
            '<div class="layui-form-mid">-</div>' +
            '<div class="layui-input-inline text-w-100">' +
            '<input type="text" name="endDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input endDateBox">'+
            '</div>' +
            '</div>' +
            '<input type="hidden" name="key" value="'+ key +'">' +
            '<!--写一个隐藏的btn -->' +
            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
            '</button>' +
            '</form>' +
            '</div>';
        return _html;
    }

    // 盖章退回记录\续租记录\变更记录\停车租赁费清单\会议室预订记录
    function getCommonDialogHtml(subTitle, key) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-120">'+ subTitle +'</label>' +
                                '<div class="layui-input-inline text-w-100">' +
                                    '<input type="text" name="beginDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input beginDateBox">'+
                                '</div>' +
                                '<div class="layui-form-mid">-</div>' +
                                '<div class="layui-input-inline text-w-100">' +
                                    '<input type="text" name="endDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input endDateBox">'+
                                '</div>' +
                            '</div>' +
                            '<input type="hidden" name="key" value="'+ key +'">' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function getCommonDialogHtml2(subTitle, key) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-120">'+ subTitle +'</label>' +
                                '<div class="layui-input-inline text-w-100">' +
                                    '<input type="text" name="beginDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input beginDateBox">'+
                                '</div>' +
                                '<div class="layui-form-mid">-</div>' +
                                '<div class="layui-input-inline text-w-100">' +
                                    '<input type="text" name="endDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input endDateBox">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-120"></label>' +
                                '<div class="layui-input-inline text-w-250">' +
                                    '<a href="javascript:;" class="c-link lastMonth">上月</a>' +
                                    '<a href="javascript:;" class="c-link curMonth">本月</a>';
                                if(key == 'KHYSQD') {
                                    _html += '<a href="javascript:;" class="c-link nextMonth">下月</a>';
                                }
                                _html +=
                                    '<a href="javascript:;" class="c-link curQuarter">本季度</a>' +
                                    '<a href="javascript:;" class="c-link curYear">本年</a>' +
                                '</div>' +
                            '</div>' +
                            '<input type="hidden" name="key" value="'+ key +'">' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    function getDfyczqdExportDialogHtml(key) {
        var _html = '<div class="layui-card-body">' +
                        '<form class="layui-form" action="" lay-filter="formDialog">' +
                            '<div class="layui-form-item label-l">' +
                                '<label class="layui-form-label text-w-80">充值日期</label>' +
                                '<div class="layui-input-inline text-w-120">' +
                                    '<input type="text" name="beginDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input beginDateBox">'+
                                '</div>' +
                                '<div class="layui-form-mid">-</div>' +
                                '<div class="layui-input-inline text-w-120">' +
                                    '<input type="text" name="endDate" lay-verify="date" placeholder="yyyy-MM-dd"  autocomplete="off" class="layui-input endDateBox">'+
                                '</div>' +
                            '</div>' +
                            '<div class="layui-form-item label-l" style="color:#888; margin-left: 40px;">说明： 充值日期是指客户在小程序中缴费的日期或线下打款到账日期</div>' +
                            '<input type="hidden" name="key" value="'+ key +'">' +
                            '<!--写一个隐藏的btn -->' +
                            '<button class="submitBtn" lay-submit lay-filter="bind" style="display: none;">' +
                            '</button>' +
                        '</form>' +
                    '</div>';
        return _html;
    }

    // 公用导出
    function handleCommonExport(o, cb) {
        Dialog.formDialog({
            title: '导出' + o.title,
            area: ['500px', 'auto'],
            content: getCommonDialogHtml(o.subTitle, o.key),
            success: function (layero, index) {
                form.render(null, 'formDialog');

                cb && cb();

                var $form = layero.find('form');

                form.on('submit(bind)', function (data) {
                    var param = $form.serializeArray();

                    var startDate = layero.find('input[name=beginDate]').val(),
                        endDate = layero.find('input[name=endDate]').val();

                    if(!DateRangeUtil.compareDate(startDate, endDate)) {
                        Dialog.errorDialog('开始日期不得大于结束日期');
                        return false;
                    }

                    Req.postReq(o.url, param, function (res) {
                        if(res.status) {
                            layer.close(index);
                            Dialog.downloadDialog({
                                downloadUrl: res.data.url
                            });
                        } else {
                            Dialog.errorDialog(res.msg);
                        }
                    });
                    return false;
                });
            }
        })
    }

    $(function() {

        $(document).on('click', '.normalExport', function() {
            var $o = $(this),
                key = $o.attr('data-key'),
                url = $o.attr('data-url');
            url += '?key=' + key;
            Req.getReq(url, function (res) {
                if(res.status) {
                    Dialog.downloadDialog({
                        downloadUrl: res.data.url
                    });
                } else {
                    Dialog.errorDialog(res.msg);
                }
            });
        });

        // 招商成交客户清单
        $(document).on('click', '.zscjkhqdexport', function() {
            var $o = $(this),
                key = $o.attr('data-key'),
                url = $o.attr('data-url');
            Dialog.formDialog({
                title: '导出招商成交客户清单',
                area: ['500px', 'auto'],
                content: getZscjkhqdDialogHtml(key),
                success: function (layero, index) {
                    form.render(null, 'formDialog');
                    var curYear = DateRangeUtil.getCurrentYear();
                    var curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');
                    renderDateBox();
                    renderBeginDateBox(curYear[0]);
                    renderEndDateBox(curDate);

                    var $form = layero.find('form');

                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();

                        Req.postReq(url, param, function (res) {
                            if(res.status) {
                                layer.close(index);
                                Dialog.downloadDialog({
                                    downloadUrl: res.data.url
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

        // 盖章退回记录\续租记录\变更记录
        $(document).on('click', '.gzthjlexport, .xzjlexport, .bgjlexport', function() {
            var $o = $(this),
                key = $o.attr('data-key'),
                url = $o.attr('data-url');
            var title = '', subTitle = '';
            if(key == 'GZTHJL') {
                title = '盖章退回记录';
                subTitle = '盖章退回日期';
            } else if(key == 'XZJL') {
                title = '续租记录';
                subTitle = '续租发起日期';
            } else if(key == 'BGJL') {
                title = '变更记录';
                subTitle = '变更发起日期';
            }
            var param = {
                title: title,
                subTitle: subTitle,
                key: key,
                url: url
            };

            handleCommonExport(param, function () {
                var date = DateRangeUtil.getPreviousMonth();

                renderBeginDateBox(date[0]);
                renderEndDateBox(date[1]);
            });
        });

        // 退租发起记录清单
        $(document).on('click', '.tzfqjlqdexport', function () {
            var $o = $(this),
                key = $o.attr('data-key'),
                url = $o.attr('data-url');

            Dialog.formDialog({
                title: '导出退租发起记录清单',
                area: ['500px', 'auto'],
                content: getTzfqjlqdexportDialogHtml(key),
                success: function (layero, index) {
                    form.render(null, 'formDialog');
                    var date = DateRangeUtil.getCurrentMonth();
                    var endDate = DateRangeUtil.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');

                    renderBeginDateBox(date[0]);
                    renderEndDateBox(endDate);

                    var $form = layero.find('form');

                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();
                        // Req.postReqCommon(url, param);

                        var startDate = layero.find('input[name=beginDate]').val(),
                            endDate = layero.find('input[name=endDate]').val();

                        if(!DateRangeUtil.compareDate(startDate, endDate)) {
                            Dialog.errorDialog('退租申请开始日期不得大于结束日期');
                            return false;
                        }

                        Req.postReq(url, param, function (res) {
                            if(res.status) {
                                layer.close(index);
                                Dialog.downloadDialog({
                                    downloadUrl: res.data.url
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

        // 电费预充值清单
        $(document).on('click', '.dfyczqdexport', function () {
            var $o = $(this),
                key = $o.attr('data-key'),
                url = $o.attr('data-url');

            Dialog.formDialog({
                title: '电费预充值清单',
                area: ['500px', 'auto'],
                content: getDfyczqdExportDialogHtml(key),
                success: function (layero, index) {
                    var $form = layero.find('form');
                    var date = DateRangeUtil.getPreviousMonth();
                    var curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');
                    renderBeginDateBox(date[0]);
                    renderEndDateBox(curDate);
                    form.render(null, 'formDialog');

                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();

                        var startDate = layero.find('input[name=beginDate]').val(),
                            endDate = layero.find('input[name=endDate]').val();

                        if(!DateRangeUtil.compareDate(startDate, endDate)) {
                            Dialog.errorDialog('开始日期不得大于结束日期');
                            return false;
                        }

                        Req.postReq(url, param, function (res) {
                            if(res.status) {
                                layer.close(index);
                                Dialog.downloadDialog({
                                    downloadUrl: res.data.url
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

        // 客户应收账清单\园区回款清单
        $(document).on('click', '.khysqdexport, .yqhkqdexport', function() {
            var $o = $(this),
                key = $o.attr('data-key'),
                url = $o.attr('data-url');
            var title = '', subTitle = '';
            if(key == 'KHYSQD') {
                title = '客户应收账清单';
                subTitle = '应收日期';
            } else if(key == 'YQHKQD') {
                title = '园区回款清单';
                subTitle = '到账日期';
            }

            Dialog.formDialog({
                title: '导出' + title,
                area: ['480px', 'auto'],
                content: getCommonDialogHtml2(subTitle, key),
                success: function (layero, index) {
                    form.render(null, 'formDialog');

                    var date = DateRangeUtil.getCurrentMonth();
                    var date2 = DateRangeUtil.getNextMonth();
                    renderBeginDateBox(date[0]);
                    renderEndDateBox(date2[1]);

                    var $form = layero.find('form');

                    // 上月
                    layero.find('.lastMonth').click(function () {
                        var tempDate = DateRangeUtil.getPreviousMonth();
                        renderBeginDateBox(tempDate[0]);
                        renderEndDateBox(tempDate[1]);
                    });

                    // 本月
                    layero.find('.curMonth').click(function () {
                        var tempDate = DateRangeUtil.getCurrentMonth();
                        renderBeginDateBox(tempDate[0]);
                        renderEndDateBox(tempDate[1]);
                    });

                    // 下月
                    layero.find('.nextMonth').click(function () {
                        var tempDate = DateRangeUtil.getNextMonth();
                        renderBeginDateBox(tempDate[0]);
                        renderEndDateBox(tempDate[1]);
                    });

                    // 本季度
                    layero.find('.curQuarter').click(function () {
                        var tempDate = DateRangeUtil.getCurrentSeason();
                        renderBeginDateBox(tempDate[0]);
                        renderEndDateBox(tempDate[1]);
                    });

                    // 本年
                    layero.find('.curYear').click(function () {
                        var tempDate = DateRangeUtil.getCurrentYear();
                        renderBeginDateBox(tempDate[0]);
                        renderEndDateBox(tempDate[1]);
                    });

                    form.on('submit(bind)', function (data) {
                        var param = $form.serializeArray();
                        // Req.postReqCommon(url, param);
                        Req.postReq(url, param, function (res) {
                            if(res.status) {
                                layer.close(index);
                                Dialog.downloadDialog({
                                    downloadUrl: res.data.url
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

        // 停车租赁费清单\会议室预订记录\开票清单
        $(document).on('click', '.tczlfqdexport, .hysydjlexport, .kpqdexport', function() {
            var $o = $(this),
                key = $o.attr('data-key'),
                url = $o.attr('data-url');
            var title = '', subTitle = '';
            if(key == 'TCZLFQD') {
                title = '停车租赁费清单';
                subTitle = '支付日期';
            } else if(key == 'HYSYDJL') {
                title = '会议室预订记录';
                subTitle = '预订日期';
            } else if(key == 'KPQD') {
                title = '开票清单';
                subTitle = '开票日期';
            }
            var param = {
              title: title,
              subTitle: subTitle,
              key: key,
              url: url
            };

            handleCommonExport(param, function () {
                var date = DateRangeUtil.getCurrentMonth();
                var curDate = Common.Util.dateFormat(new Date(new Date().getTime()), 'yyyy-MM-dd');

                renderBeginDateBox(date[0]);
                renderEndDateBox(curDate);
            });
        });

        // 园区计租率明细清单
        $(document).on('click', '.yqjzlmxqdexport', function() {
            var $o = $(this),
                key = $o.attr('data-key'),
                url = $o.attr('data-url');
            var title = '', subTitle = '';
            if(key == 'YQJZLMXQD') {
                title = '园区计租率明细清单';
                subTitle = '统计日期';
            }
            var param = {
                title: title,
                subTitle: subTitle,
                key: key,
                url: url
            };

            handleCommonExport(param, function () {
                var curYear = DateRangeUtil.getCurrentYear();
                var curDate = Common.Util.dateFormat(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
                renderBeginDateBox(curYear[0]);
                renderEndDateBox(curDate);
            });
        });
    });
});