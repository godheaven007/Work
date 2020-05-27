/**
 * author: xusf
 * description: 财务科目
 * createDate: 2019-08-08
 */

layui.define(function(exports){
    var $ = layui.jquery;

    function Tree(_config) {
        this.init(_config);
        this.eventHandle();
    }

    Tree.prototype = {
        constructor: Tree,
        // 配置扩展参数
        defaults: {
            // 弹框标题
            title: '选择科目',
            // 右侧标题
            treeViewTitle: '已选择',
            // 当选择左侧人员个数为0时，【确认】按钮默认disabled；当设置为true时，不受此限制
            isConfirmBtnShow: true,
            // 输入框提示语
            searchPlaceHolder: '搜索科目名称',
            // 默认显示
            isShow: true,
            // 回调函数立即调用
            isInvokeImmediate: false
        },

        init: function(_config) {
            this.config = $.extend({}, this.defaults, _config);
            this.subjectIdArr = [];           // 覆盖范围Id（事业部：dept_xxx, 区域：region_xxx, 项目: park_xxx或base_xxx）
            this.subjectNameArr = [];         // 覆盖范围对应名称
            this.treeViewArr = [];
            this.searchViewArr = [];

            this.render(_config.data);
        },

        // dom渲染
        render: function(data) {
            var treeHeadHtml,
                treeMidHtml,
                treeBotHtml;
            this.$tree = $('<div class="s-tree-mask"><div class="s-tree-wrap"></div></div>');

            treeHeadHtml = '<div class="s-tree-head">' +
                '<div class="s-tree-title">'+ this.config.title +'</div>' +
                '<div class="s-tree-close"></div>' +
                '</div>';
            treeMidHtml = '<div class="s-tree-middle">' +
                '<div class="s-tree-struct-wrap">' +
                '<div class="s-tree-search">' +
                '<input type="text" class="s-tree-search-input" placeholder="'+ this.config.searchPlaceHolder +'">' +
                '<span class="s-tree-search-icon"></span>' +
                '<div class="s-treeResultWrap">' +
                '<ul class="s-tree-search-result"></ul>' +
                '</div>' +
                '</div>' +
                '<ul class="s-tree-struct">'+ this.getTreeNodes(data) +'</ul>' +
                '</div>' +
                '<div class="s-tree-view-wrap">' +
                '<div class="s-tree-view-title">'+
                this.config.treeViewTitle +
                '<span class="s-tree-view-clear">清空</span>' +
                '</div>' +
                '<div class="s-treeViewWrap">'+
                '<ul class="s-tree-view"></ul>' +
                '</div>' +
                '</div>' +
                '</div>';

            treeBotHtml = '<div class="s-tree-bottom"><div class="s-tree-btn s-tree-btn-cancel">取&nbsp;&nbsp;消</div>';

            if(this.config.isConfirmBtnShow) {
                treeBotHtml += '<div class="s-tree-btn s-tree-btn-confirm">确&nbsp;&nbsp;定</div>';
            } else {
                treeBotHtml += '<div class="s-tree-btn s-tree-btn-confirm disabled">确&nbsp;&nbsp;定</div>';
            }
            treeBotHtml += '</div>';

            this.$tree.find('.s-tree-wrap').append(treeHeadHtml);
            this.$tree.find('.s-tree-wrap').append(treeMidHtml);
            this.$tree.find('.s-tree-wrap').append(treeBotHtml);

            $('body').append(this.$tree);
            // $('.s-tree-wrap .s-tree-struct').mCustomScrollbar({ theme: "minimal" });
            // $('.s-tree-wrap .s-treeViewWrap').mCustomScrollbar({ theme: "minimal" });
            // $('.s-tree-wrap .s-treeResultWrap').mCustomScrollbar({ theme: "minimal" });

            if(this.config.isShow) {
                this.$tree.show();
            } else {
                this.$tree.hide();
            }

            var _this = this;
            if(this.config.edit && Array.isArray(this.config.edit)) {
                // 添加完后编辑
                setTimeout(function() {
                    _this.edit(_this.config.edit);
                    if(_this.config.isInvokeImmediate) {
                        _this.config.callback(_this);
                    }
                },0)
            }
        },

        // 获取树形结构节点
        getTreeNodes: function(data) {
            var html = '';

            if(Array.isArray(data) && data.length) {
                for(var i = 0, length = data.length; i < length; i++) {
                    var pTitle = data[i].subName;
                    if(data[i].threeSubjects && data[i].threeSubjects.length) {
                        // 二级下若没有三级科目，直接不显示
                        html += '<li class="hasChildren collapsable" type="branch" level="level1" subId="'+ data[i].subId +'">' +
                                    '<div class="s-tree-struct-item branch" subId="'+ data[i].subId +'" title="'+ data[i].subName +'">' +
                                        data[i].subName +
                                        '<span class="s-tree-icon-select" subId="'+ data[i].subId +'"></span>' +
                                    '</div>' +
                                    '<ul>' +
                                        getSubjectHtml(pTitle, data[i].threeSubjects) +
                                    '</ul>' +
                                '</li>';
                    }
                }
            }

            // 区域
            function getSubjectHtml(pTitle, subList) {
                var tempHtml = '';
                for(var i = 0, length = subList.length; i < length; i++) {
                    tempHtml += '<li level="level2" type="leaf" subId="'+ subList[i].subId +'">' +
                        '<div class="s-tree-struct-item leaf" subId="'+ subList[i].subId +'" subName="'+ pTitle + '-' + subList[i].subName +'" title="'+ pTitle + '-' + subList[i].subName +'">' +
                        subList[i].subName +
                        '<span class="s-tree-icon-select" subId="'+ subList[i].subId +'" subName="'+ pTitle + '-' + subList[i].subName +'"></span>' +
                        '</div>' +
                        '</li>';
                }
                return tempHtml;
            }
            return html;
        },

        eventCenter: {
            // 关闭、取消
            close: function() {
                this.removeEventListener();
                this.$tree.remove();
            },

            // 确定
            confirm: function(e) {
                if($(e.target).hasClass('disabled')) return false;
                this.config.callback(this);
            },

            // 展开、收缩
            toggle: function(e) {
                e.stopPropagation();
                var $target = $(this);
                if(e.target == this) {
                    if($target.hasClass('expandable')) {
                        $target.attr('class', 'hasChildren collapsable');
                        $target.children('ul').slideDown();
                    } else {
                        $target.attr('class', 'hasChildren expandable');
                        $target.children('ul').slideUp();
                    }
                }
            },

            // 左侧添加或删除
            doLeft: function(e) {
                e.stopPropagation();
                var $target = $(e.target);

                // 区分点击的是 .s-tree-struct-item还是.s-tree-icon-select
                if($target.hasClass('s-tree-icon-select')) {
                    this.handle($target.parent('.s-tree-struct-item'));
                } else {
                    this.handle($target);
                }
                $('.s-tree-wrap .s-treeResultWrap').hide();
            },

            // 右侧删除
            deleteFix: function(e) {
                var subId = $(this).attr('subid');
                $('.s-tree-wrap .s-tree-struct-item.leaf[subid="'+ subId +'"]').eq(0).trigger('click');
            },

            clearAll: function() {
                $('.s-tree-wrap .s-tree-struct-item').removeClass('active');
                $('.s-tree-wrap .s-tree-view').html('');
                this.subjectIdArr = [];
                this.subjectNameArr = [];
                this.treeViewArr = [];
                this.searchViewArr = [];
                // $('.s-tree-wrap .s-tree-btn-confirm').addClass('disabled');
            },

            // 搜索
            search: function(e) {
                var keyword = $(e.target).val();
                if($.trim(keyword) == '') {
                    $('.s-tree-wrap .s-tree-search-result').html('');
                    $('.s-tree-wrap .s-treeResultWrap').hide();
                    return;
                } else {
                    this.search(keyword);
                }
            },
            focus: function() {
                if($('.s-tree-wrap .s-tree-search-result').find('li').length) {
                    $('.s-tree-wrap .s-treeResultWrap').show();
                }
            },
            searchItemClick: function(e) {
                e.stopPropagation();
                this.appendItem($(e.target));
                $('.s-tree-wrap .s-treeResultWrap').hide();
            }
        },

        removeEventListener: function() {
            $(document).off('click', '.s-tree-wrap .s-tree-close, .s-tree-wrap .s-tree-btn-cancel', jQuery.proxy( this.eventCenter.close, this));
            $(document).off('click', '.s-tree-wrap .s-tree-btn-confirm', jQuery.proxy( this.eventCenter.confirm, this));
            $(document).off('click', '.s-tree-wrap .hasChildren', this.eventCenter.toggle);
            $(document).off('click', '.s-tree-wrap .s-tree-icon-select, .s-tree-wrap .s-tree-struct-item', jQuery.proxy( this.eventCenter.doLeft, this));
            $(document).off('click', '.s-tree-wrap .s-tree-view-item-close', this.eventCenter.deleteFix);
            $(document).off('click', '.s-tree-wrap .s-tree-view-clear', jQuery.proxy( this.eventCenter.clearAll, this));

            $(document).off('propertychange input', '.s-tree-wrap .s-tree-search-input', jQuery.proxy( this.eventCenter.search, this));
            $(document).off('focus', '.s-tree-wrap .s-tree-search-input', this.eventCenter.focus);
            $(document).off('click', '.s-tree-wrap .s-tree-search-item', jQuery.proxy(this.eventCenter.searchItemClick,this));
        },

        // 事件处理
        eventHandle: function() {
            var _this = this;

            /****************************************************************************************************/
            // 关闭、取消
            $(document).on('click', '.s-tree-wrap .s-tree-close, .s-tree-wrap .s-tree-btn-cancel', jQuery.proxy( this.eventCenter.close, _this));

            // 确定
            $(document).on('click', '.s-tree-wrap .s-tree-btn-confirm', jQuery.proxy(this.eventCenter.confirm, _this));

            // 展开、合并
            $(document).on('click', '.s-tree-wrap .hasChildren', this.eventCenter.toggle);

            // 左侧选择
            $(document).on('click', '.s-tree-wrap .s-tree-icon-select, .s-tree-wrap .s-tree-struct-item', jQuery.proxy(this.eventCenter.doLeft, _this));

            // 删除
            $(document).on('click', '.s-tree-wrap .s-tree-view-item-close', this.eventCenter.deleteFix);

            // 清空
            $(document).on('click', '.s-tree-wrap .s-tree-view-clear', jQuery.proxy(this.eventCenter.clearAll, _this));

            // 搜索
            $(document).on('propertychange input focus', '.s-tree-wrap .s-tree-search-input', jQuery.proxy( this.eventCenter.search, _this));
            $(document).on('click', function() {
                $('.s-tree-wrap .s-tree-search-input').blur();
                $('.s-treeResultWrap').hide();
            });
            $(document).on('click', '.s-tree-wrap .s-tree-search', function(e) {
                e.stopPropagation();
            });
            $(document).on('click', '.s-tree-wrap .s-tree-search-item', jQuery.proxy(this.eventCenter.searchItemClick,_this));
            /****************************************************************************************************/
        },

        handle: function($target) {
            if($target.hasClass('active')) {
                // 已选中
                this.removeItem($target);
            } else {
                // 未选中
                this.appendItem($target);
            }
            this.updateStyle();
            this.updateTreeView();
        },

        // 添加
        appendItem: function($target) {
            // $target.addClass('active');
            var subId = $target.attr('subId');
            $('.s-tree-wrap .s-tree-struct-item[subId='+ subId +']').addClass('active');
            if($target.hasClass('branch')) {
                // 事业部或区域
                $target.next('ul').find('.s-tree-struct-item ').addClass('active');
            }
        },

        // 删除
        removeItem: function($target) {
            // $target.removeClass('active');
            var subId = $target.attr('subId');
            $('.s-tree-wrap .s-tree-struct-item[subId='+ subId +']').removeClass('active');
            if($target.hasClass('branch')) {
                // 事业部或区域
                $target.next('ul').find('.s-tree-struct-item ').removeClass('active');
            }
        },

        // 更新左侧联动选中样式
        updateStyle: function() {
            var $branch = $('.s-tree-wrap li[level=level1]'),
                _this = this;

            $branch.each(function(i, o) {
                _this.updateSelectStatus($(o));
            });
        },

        updateSelectStatus: function($target) {
            var _this = this;
            var $curAllLeafs = $target.find('.s-tree-struct-item.leaf'),             // 当前分支下的所有可选叶子节点
                $curSelectedLeafs = $target.find('.s-tree-struct-item.leaf.active'); // 当前分支下的选中的叶子节点

            if($curAllLeafs.length == $curSelectedLeafs.length) {
                $target.children('div.s-tree-struct-item.branch').addClass('active');
            } else {
                $target.children('div.s-tree-struct-item.branch').removeClass('active');
            }

            var $filterLiNodes = $target.children('ul').children('li[type=branch]');

            if($filterLiNodes.length) {
                $filterLiNodes.each(function(index, obj) {
                    _this.updateSelectStatus($(obj));
                });
            }
        },

        // 更新右侧内容
        getData: function() {
            this.subjectIdArr.length = 0;
            this.subjectNameArr.length = 0;

            var _this = this;

            var $activeLeafs = $('.s-tree-wrap .s-tree-struct .s-tree-struct-item.leaf.active');

            $activeLeafs.each(function(i, o) {
                var subId = $(o).attr('subid'),
                    subName = $(o).attr('subname');
                _this.subjectIdArr.push(subId);
                _this.subjectNameArr.push(subName);
            });
        },

        updateTreeView: function() {
            var html = '';
            var $activeItemLeafs = $('.s-tree-wrap .s-tree-struct .s-tree-struct-item.leaf.active');

            $activeItemLeafs.each(function(i, o) {
                var subId = $(o).attr('subid'),
                    subName = $(o).attr('subname');
                html += '<li class="s-tree-view-item" title="'+ subName +'">' +
                    subName +
                    '<span class="s-tree-view-item-close" subId="'+ subId +'"></span>' +
                    '</li>';
            });

            $('.s-tree-wrap .s-tree-view').html(html);

            this.getData();
            // if(this.subjectIdArr.length == 0) {
            //     $('.s-tree-wrap .s-tree-btn-confirm').addClass('disabled');
            // } else {
            //     $('.s-tree-wrap .s-tree-btn-confirm').removeClass('disabled');
            // }
        },

        edit: function(editArr) {
            for(var i = 0, len = editArr.length; i < len; i++) {
                var subId = editArr[i];
                $('.s-tree-wrap .s-tree-struct-item.leaf[subid='+ subId +']').trigger('click');
            }
        },

        // 搜索部门
        search: function(keyword) {
            $('.s-tree-wrap .s-tree-search-result').html('');
            this.searchViewArr.length = 0;

            this.searchHandle(keyword);

            if(this.searchViewArr.length) {
                $('.s-tree-wrap .s-tree-search-result').html(this.searchViewArr.join(''));
                $('.s-tree-wrap .s-tree-search-result').find('ul').hide();
            } else {
                $('.s-tree-wrap .s-tree-search-result').html('<li>没有匹配结果!</li>');
            }

            $('.s-tree-wrap .s-treeResultWrap').show();
        },

        searchHandle: function(keyword) {
            var subjectIdArr = [],
                leafHtmlArr = [];
            var $treeStructItems = $('.s-tree-wrap .s-tree-struct-item.leaf');

            $treeStructItems.each(function(i, o) {
                var txt = $(o).text();
                if(txt.indexOf(keyword) !== -1) {
                    var subId = $(o).attr('subid');
                    if(subjectIdArr.indexOf(subId) == -1) {
                        // 以防项目存在于多个区域中
                        subjectIdArr.push(subId);

                        var tempSubName = $(o).attr('subname');

                        var $tempTarget = $($(o).parent().prop('outerHTML'));
                        var innerHtml = tempSubName + '<span class="s-tree-icon-select" subid="'+ subId +'" subname="'+ tempSubName +'"></span>';
                        $tempTarget.find('.s-tree-struct-item.leaf').html(innerHtml);
                        leafHtmlArr.push($tempTarget.prop('outerHTML'));
                    }
                }
            });
            this.searchViewArr = leafHtmlArr;
        },

        close: function() {
            this.$tree.remove();
        },

        hide: function() {
            this.$tree.hide();
        },
    }

    function init(option){
        return new Tree(option);
    }

    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('SUBTree', init);
});