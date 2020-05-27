/**
 * OMS-活动管理（选择园区）
 * （废弃）
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
            title: '选择园区',
            // 选择操作类型(单选：false, 多选：true)
            type: true,
            // 当选择左侧人员个数为0时，【确认】按钮默认disabled；当设置为true时，不受此限制
            isConfirmBtnShow: false,
            // 输入框提示语
            searchPlaceHolder: '搜索地区或园区',
            // 区分PC、笔记本
            _height: 800,
            // 是否显示【其他】部门
            showOther: true
        },

        init: function(_config) {
            this.config = $.extend({}, this.defaults, _config);
            this.regionsIdArr = [];     // 区域id
            this.parkIdArr = [];        // 园区id
            this.apNameArr = [];        // 区域名或园区名
            this.treeViewArr = [];
            this.searchViewArr = [];

            this.render(_config.data);
        },

        render: function(data) {
            var treeHeadHtml,
                treeMidHtml,
                treeBotHtml;

            // 可见区域高度
            var pageHeight = document.documentElement.clientHeight;
            if(pageHeight > this.config._height) {
                // PC
                this.$tree = $('<div class="dp-tree-mask"><div class="dp-tree-wrap"></div></div>');
            } else {
                // 笔记本
                this.$tree = $('<div class="dp-tree-mask adapt"><div class="dp-tree-wrap"></div></div>');
            }

            treeHeadHtml = '<div class="dp-tree-head">' +
                '<div class="dp-tree-title">'+ this.config.title +'</div>' +
                '<div class="dp-tree-close"></div>' +
                '</div>';
            treeMidHtml = '<div class="dp-tree-middle">' +
                                '<div class="dp-tree-struct-wrap">' +
                                    '<div class="dp-tree-search">' +
                                        '<input type="text" class="dp-tree-search-input" placeholder="'+ this.config.searchPlaceHolder +'">' +
                                        '<span class="dp-tree-search-icon"></span>' +
                                        '<div class="dp-treeResultWrap">' +
                                            '<ul class="dp-tree-search-result">' +

                                            '</ul>' +
                                        '</div>' +
                                    '</div>' +
                                    '<ul class="dp-tree-struct">'+
                                        '<li class="hasChildren expandable" regionsId="" parkId="">' +
                                            '<div class="dp-tree-struct-item branch">' +
                                                '全国' +
                                            '<span class="dp-tree-icon-depart"></span>' +
                                            '<span class="dp-tree-icon-select" regionsId="0" parkId="" data-name="全国"></span>' +
                                            '</div>' +
                                            '<ul>' +
                                                this.getStructHtml(data) +
                                            '</ul>' +
                                        '</li>' +
                                    '</ul>' +
                                '</div>' +
                                '<div class="dp-tree-view-wrap">' +
                                    '<div class="dp-tree-view-title">已选择的地区或园区</div>' +
                                    '<div class="dp-treeViewWrap">'+
                                        '<div class="dp-tree-view">' +

                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';
            treeBotHtml = '<div class="dp-tree-bottom">' +
                '<div class="dp-tree-btn dp-tree-btn-cancel">取&nbsp;&nbsp;消</div>';

            if(this.config.isConfirmBtnShow) {
                treeBotHtml += '<div class="dp-tree-btn dp-tree-btn-confirm">确&nbsp;&nbsp;定</div>';
            } else {
                treeBotHtml += '<div class="dp-tree-btn dp-tree-btn-confirm disabled">确&nbsp;&nbsp;定</div>';
            }
            treeBotHtml += '</div>';

            this.$tree.find('.dp-tree-wrap').append(treeHeadHtml);
            this.$tree.find('.dp-tree-wrap').append(treeMidHtml);
            this.$tree.find('.dp-tree-wrap').append(treeBotHtml);

            $('body').append(this.$tree);

            // 展开到第二级
            var $secondLevel = $('.dp-tree-struct').children('li');
            $secondLevel.each(function(index, o) {
                if($(o).hasClass('hasChildren')) {
                    $(o).removeClass();
                    $(o).addClass('hasChildren collapsable');
                    $(o).children('ul').show();
                }
            });

            this.$tree.show();

            // 防止系统弹框跟本属性结构层级重叠
            if(this.config.zIndex) {
                this.$tree.css('z-index', this.config.zIndex);
            }
            var that = this;
            if(this.config.edit && Array.isArray(this.config.edit)) {
                // 添加完后编辑
                setTimeout(function() {
                    that.edit(that.config.edit);
                },0)

            }
        },

        getStructHtml: function(list) {
            var _html = '';
            for(var i = 0, len = list.length; i < len; i++) {
                var curItem = list[i];
                var regionsId = !curItem.regionsId ? '' : curItem.regionsId,
                    parkId = !curItem.parkId ? '' : curItem.parkId;

                // 当前节点是否有子节点
                if(curItem.parkList && curItem.parkList.length) {
                    _html += '<li class="hasChildren expandable" regionsId="' + regionsId + '" parkId="'+ parkId +'">' +
                        '<div class="dp-tree-struct-item branch">' +
                        curItem.regionsName +
                        '<span class="dp-tree-icon-depart"></span>' +
                        '<span class="dp-tree-icon-select" regionsId="' + regionsId + '" parkId="'+ parkId +'" data-name="' + curItem.regionsName + '"></span>' +
                        '</div>' +
                        '<ul style="display: none;">' +
                        this.getStructHtml(curItem.parkList) +
                        '</ul>' +
                        '</li>';
                } else {
                    _html += '<li regionsId="'+ regionsId +'" parkId="'+ parkId +'">';

                    if(!curItem.parkId) {
                        // 省市区
                        _html += '<div class="dp-tree-struct-item leaf" title="'+ curItem.regionsName +'">' +
                                    curItem.regionsName +
                                    '<span class="dp-tree-icon-depart"></span>' +
                                    '<span class="dp-tree-icon-select" regionsId="'+ regionsId +'" parkId="'+ parkId +'" data-name="'+ curItem.regionsName +'"></span>' +
                                '</div>' +
                            '</li>';
                    } else {
                        // 园区
                        _html +='<div class="dp-tree-struct-item leaf" title="'+ curItem.parkName +'">'+
                            curItem.parkName +
                            '<span class="dp-tree-icon-park"></span>' +
                            '<span class="dp-tree-icon-select" regionsId="'+ regionsId +'" parkId="'+ parkId +'" data-name="'+ curItem.parkName +'"></span>' +
                            '</div>' +
                            '</li>';
                    }
                }
            }
            return _html;
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
                var $o;
                if($(e.target).hasClass('leaf')) return false;

                if($(e.target).hasClass('dp-tree-struct-item')) {
                    $o = $(e.target).parent();
                } else {
                    $o = $(e.target);
                }

                if($o.hasClass('expandable')) {
                    $o.attr('class', 'hasChildren collapsable');
                    $o.children('ul').slideDown();
                } else if($o.hasClass('collapsable')){
                    $o.attr('class', 'hasChildren expandable');
                    $o.children('ul').slideUp();
                }
            },
            // 左侧添加或删除
            doLeft: function(e) {
                e.stopPropagation();
                this.handle($(e.target));
                $('.dp-tree-wrap .dp-treeResultWrap').hide();

            },
            // 删除
            deleteFix: function(e) {
                var regionsId = $(this).attr('regionsid'),
                    parkId = $(this).attr('parkid');
                if(!parkId) {
                    // 省市区
                    $('.dp-tree-wrap .dp-tree-icon-select[regionsid='+ regionsId +'][parkid=""]').eq(0).trigger('click');
                } else {
                    $('.dp-tree-wrap .dp-tree-icon-select[parkid='+ parkId +']').eq(0).trigger('click');
                }

            },
            // 搜索
            search: function(e) {
                var keyword = $(e.target).val();
                if($.trim(keyword) == '') {
                    $('.dp-tree-wrap .dp-tree-search-result').html('');
                    $('.dp-tree-wrap .dp-treeResultWrap').hide();
                    return;
                } else {
                    this.search(keyword);
                }
            },
            focus: function() {
                if($('.dp-tree-wrap .dp-tree-search-result').find('li').length) {
                    $('.dp-tree-wrap .dp-treeResultWrap').show();
                }
            },
            searchItemClick: function(e) {
                e.stopPropagation();
                this.appendItem($(e.target));
                $('.dp-tree-wrap .dp-treeResultWrap').hide();
            }
        },

        removeEventListener: function() {
            $(document).off('click', '.dp-tree-wrap .dp-tree-close, .dp-tree-wrap .dp-tree-btn-cancel', jQuery.proxy( this.eventCenter.close, this));
            $(document).off('click', '.dp-tree-wrap .dp-tree-btn-confirm', jQuery.proxy( this.eventCenter.confirm, this));
            $(document).off('click', '.dp-tree-wrap .hasChildren', this.eventCenter.toggle);
            $(document).off('click', '.dp-tree-wrap .dp-tree-icon-select', jQuery.proxy( this.eventCenter.doLeft, this));
            $(document).off('click', '.dp-tree-wrap .dp-tree-icon-close', this.eventCenter.deleteFix);
            $(document).off('propertychange input', '.dp-tree-wrap .dp-tree-search-input', jQuery.proxy( this.eventCenter.search, this));
            $(document).off('focus', '.dp-tree-wrap .dp-tree-search-input', this.eventCenter.focus);
            $(document).off('click', '.dp-tree-wrap .dp-tree-search-item', jQuery.proxy(this.eventCenter.searchItemClick,this));
        },
        // 事件处理
        eventHandle: function() {
            var _this = this;

            // 关闭、取消
            $(document).on('click', '.dp-tree-wrap .dp-tree-close, .dp-tree-wrap .dp-tree-btn-cancel', jQuery.proxy( this.eventCenter.close, _this));

            // 确定
            $(document).on('click', '.dp-tree-wrap .dp-tree-btn-confirm', jQuery.proxy( this.eventCenter.confirm, _this));

            // 展开、关闭
            $(document).on('click', '.dp-tree-wrap .hasChildren', this.eventCenter.toggle);

            // 左侧选择
            $(document).on('click', '.dp-tree-wrap .dp-tree-icon-select', jQuery.proxy( this.eventCenter.doLeft, _this));

            // 删除
            $(document).on('click', '.dp-tree-wrap .dp-tree-icon-close', this.eventCenter.deleteFix);

            // 搜索
            $(document).on('propertychange input', '.dp-tree-wrap .dp-tree-search-input', jQuery.proxy( this.eventCenter.search, _this));
            $(document).on('focus', '.dp-tree-wrap .dp-tree-search-input', this.eventCenter.focus);
            $(document).on('click', function() {
                $('.dp-tree-wrap .dp-tree-search-input').blur();
                $('.dp-tree-wrap .dp-treeResultWrap').hide();
            });
            $(document).on('click', '.dp-tree-wrap .dp-tree-search', function(e) {
                e.stopPropagation();
            });
            $(document).on('click', '.dp-tree-wrap .dp-tree-search-item', jQuery.proxy(this.eventCenter.searchItemClick,_this));
        },

        handle: function($target) {
            var regionsId = $target.attr('regionsid'),
                parkId = $target.attr('parkid');
            if($target.hasClass('active')) {
                // 已选中
                if(!parkId) {
                    $('.dp-tree-wrap .dp-tree-icon-select[regionsid='+ regionsId +'][parkid=""]').removeClass('active');
                } else {
                    $('.dp-tree-wrap .dp-tree-icon-select[parkid='+ parkId +']').removeClass('active');
                }
                this.dataHandle($target, 'remove');
            } else {
                // 未选中
                if(!this.config.type) {
                    // 单选
                    $('.dp-tree-wrap .dp-tree-icon-select').removeClass('active');
                    if(parkId == 'null') {
                        $('.dp-tree-wrap .dp-tree-icon-select[regionsid='+ regionsId +']').addClass('active');
                    } else {
                        $('.dp-tree-wrap .dp-tree-icon-select[parkid='+ parkId +']').addClass('active');
                    }
                } else {
                    // 多选
                    if(!parkId) {
                        $('.dp-tree-wrap .dp-tree-icon-select[regionsid='+ regionsId +'][parkid=""]').addClass('active');
                    } else {
                        $('.dp-tree-wrap .dp-tree-icon-select[parkid='+ parkId +']').addClass('active');
                    }
                }
                this.dataHandle($target, 'append');
            }

            this.updateTreeView();
        },

        getSelectHtml: function($node) {
            return $node.parent().prop('outerHTML');
        },

        /**
         * 数据处理
         * @param $node
         * @param type append或remove
         */
        dataHandle: function($node, type) {
            var regionsId = $node.attr('regionsid'),
                parkId = $node.attr('parkid'),
                apName = $node.attr('data-name');

            if(type == 'append') {
                if(!this.config.type) {
                    // 单选
                    this.reset();
                }
                this.regionsIdArr.push(regionsId);
                this.parkIdArr.push(parkId);
                this.apNameArr.push(apName);
                this.treeViewArr.push(this.getSelectHtml($node));
            } else if(type == 'remove') {
                if(!parkId) {
                    // 省市区
                    var index = this.regionsIdArr.indexOf(regionsId);
                    if(index != -1) {
                        this.regionsIdArr.splice(index,1);
                        this.parkIdArr.splice(index,1);
                        this.apNameArr.splice(index,1);
                        this.treeViewArr.splice(index, 1);
                    }
                } else {
                    // 园区
                    var index = this.parkIdArr.indexOf(parkId);
                    if(index != -1) {
                        this.regionsIdArr.splice(index,1);
                        this.apNameArr.splice(index,1);
                        this.treeViewArr.splice(index, 1);
                    }
                }
            }
        },

        // 更新右侧内容
        updateTreeView: function() {
            var _html = '';

            _html = this.treeViewArr.join('');
            _html = _html.replace(/dp-tree-icon-select/g, 'dp-tree-icon-close');
            $('.dp-tree-view').html(_html);
            // 【确认】按钮是否可点击

            if(this.config.isConfirmBtnShow) {
                $('.dp-tree-wrap .dp-tree-btn-confirm').removeClass('disabled');
            } else {
                if(this.regionsIdArr.length == 0) {
                    $('.dp-tree-wrap .dp-tree-btn-confirm').addClass('disabled');
                } else {
                    $('.dp-tree-wrap .dp-tree-btn-confirm').removeClass('disabled');
                }
            }
        },

        reset: function() {
            this.regionsIdArr.length = 0;
            this.apNameArr.length = 0;
            this.treeViewArr.length = 0;
        },

        edit: function(editArr) {
            for(var i = 0, len = editArr.length; i < len; i++) {
                var regionsId = editArr[i].regionsId,
                    parkId = editArr[i].parkId;
                if(!parkId) {
                    $('.dp-tree-wrap .dp-tree-struct .dp-tree-icon-select[regionsid='+ regionsId +'][parkid=""]').trigger('click');
                } else {
                    console.log($('.dp-tree-wrap .dp-tree-struct .dp-tree-icon-select[parkid=' + parkId + ']').length);
                    $('.dp-tree-wrap .dp-tree-struct .dp-tree-icon-select[parkid='+ parkId +']').trigger('click');
                }
            }
        },

        // 搜索成员或部门
        search: function(keyword) {

            $('.dp-tree-wrap .dp-tree-search-result').html('');
            this.searchViewArr.length = 0;

            this.searchDepart(keyword);

            if(this.searchViewArr.length) {
                $('.dp-tree-wrap .dp-tree-search-result').html(this.searchViewArr.join(''));
                $('.dp-tree-wrap .dp-tree-search-result').find('li.hasChildren').removeClass().addClass('hasChildren expandable');
                $('.dp-tree-wrap .dp-tree-search-result').find('ul').hide();
            } else {
                $('.dp-tree-wrap .dp-tree-search-result').html('<li>没有匹配结果!</li>');
            }

            $('.dp-tree-wrap .dp-treeResultWrap').show();
        },

        // 搜索部门
        searchDepart: function(keyword) {
            var $topDeparts = $('.dp-tree-wrap .dp-tree-struct').children('li'),
                _this = this;

            $topDeparts.each(function(i,o) {
                _this.searchDepartHandle($(o), keyword);
            });
        },

        searchDepartHandle: function($o, keyword) {
            var _this = this,
                dName = $o.children('.dp-tree-struct-item').text(),
                $childDeparts = $o.children('ul').children('li');

            if(dName.indexOf(keyword) != -1) {
                this.searchViewArr.push($o.prop('outerHTML'));
            } else {
                if($childDeparts.length) {
                    $childDeparts.each(function(i,o) {
                        _this.searchDepartHandle($(o), keyword)
                    });
                }
            }
        },

        close: function() {
            this.$tree.remove();
        },

        hide: function() {
            this.$tree.hide();
        },
    };

    function init(option) {
        return new Tree(option);
    }
    // 注意，这里是模块输出的核心，模块名必须和use时的模块名一致
    exports('ATree', init);
});