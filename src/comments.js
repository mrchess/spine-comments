(function() {
  var Comment, Comment_edit, Comment_one, Comment_reply, Comments, attrs;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  attrs = ['creationDate', 'creatorName', 'creatorLoginName', 'commentTitle', 'commentContent', 'commentId', 'unread', 'commentNumber', 'commentColor', 'pageNumber', 'pageHeight', 'pageWidth', 'replyTo'];
  Comment = Spine.Model.setup('Comment', attrs);
  Comments = Spine.Controller.create({
    proxied: ['addOne'],
    init: function() {
      return Comment.bind('create', this.addOne);
    },
    addOne: function(comment) {
      var c, el, target;
      c = Comment_one.init({
        comment: comment
      });
      el = c.render().el;
      if (comment.replyTo) {
        target = $("#sp-comment-" + comment.replyTo);
        if (target.length) {
          return target.find('.child').first().append(el);
        }
      } else {
        return this.el.append(el);
      }
    }
  });
  Comment_edit = Spine.Controller.create({
    tag: 'div',
    template: '\
    <div class="edit-ta">\
      <textarea>{0}</textarea>\
      <div class="controls">\
        <button class="submit btn primary">Save</span>\
        <button class="cancel btn">Cancel</span>\
      </div>\
    </div>\
  ',
    elements: {
      'textarea': 'textarea'
    },
    events: {
      'click .submit': 'submit',
      'click .cancel': 'remove'
    },
    submit: function() {
      this.comment.commentContent = this.textarea.val();
      this.comment.save();
      return this.remove();
    },
    remove: function() {
      return this.el.fadeOut(__bind(function(el) {
        return this.owner.trigger('editRemoved', true);
      }, this));
    },
    render: function() {
      var html;
      html = this.template.format(this.comment.commentContent);
      this.el.html(html);
      this.refreshElements();
      return this;
    }
  });
  Comment_reply = Spine.Controller.create({
    tag: 'div',
    template: '\
    <div class="reply-ta">\
      <textarea></textarea>\
      <div class="controls">\
        <button class="submit btn primary">Post</span>\
        <button class="cancel btn">Cancel</span>\
      </div>\
    </div>\
  ',
    elements: {
      'textarea': 'textarea'
    },
    events: {
      'click .submit': 'submit',
      'click .cancel': 'remove'
    },
    submit: function() {
      return this.el.fadeOut(__bind(function() {
        var comment;
        comment = {
          creationDate: (new Date).getTime(),
          creatorName: "REPLYGUY",
          commentContent: this.textarea.val(),
          commentId: "999",
          replyTo: this.comment.commentId
        };
        return Comment.create(comment);
      }, this));
    },
    remove: function() {
      return this.el.fadeOut(function() {
        return $(this).remove();
      });
    },
    render: function() {
      this.el.html(this.template);
      this.refreshElements();
      return this;
    }
  });
  Comment_one = Spine.Controller.create({
    proxied: ['renderBody'],
    tag: 'div',
    events: {
      'click .collapse': 'collapse',
      'click .edit': 'toggleEdit',
      'click .reply': 'toggleReply',
      'click .delete': 'remove'
    },
    elements: {
      '.collapse': 'collapse',
      '.content': 'content',
      '.controls': 'controls',
      '.body': 'body'
    },
    template: '\
    <div>\
      <div>\
        <span class="collapse">[-]</span>\
        <span class="meta"> comment posted by <b>{0}</b> {1}</span>\
      </div>\
      <div class="content">\
        <div class="body"> {2} </div>\
        <div class="controls">\
          <a href="#" class="edit action">Edit</a>\
          <a href="#" class="reply action">Reply</a>\
          <a href="#" class="delete action">Delete</a>\
        </div>\
        <div class="child"></div>\
      </div>\
    </div>\
  ',
    template_unread: '\
    <span class="label success">New</span>\
  ',
    init: function() {
      this.comment.bind('update', this.renderBody);
      return this.bind('editRemoved', this.toggleEdit);
    },
    remove: function() {
      var remove;
      remove = confirm('Are you sure?');
      if (remove) {
        this.el.fadeOut();
      }
      return false;
    },
    collapse: function() {
      var visible;
      visible = this.content.is(':visible');
      switch (visible) {
        case true:
          this.content.slideUp();
          this.collapse.html('[+]');
          break;
        case false:
          this.content.slideDown();
          this.collapse.html('[-]');
      }
      return false;
    },
    toggleEdit: function(removing) {
      var editing;
      editing = (removing === true) || false;
      switch (editing) {
        case true:
          this.body.fadeIn();
          break;
        case false:
          this.body.fadeOut(__bind(function() {
            var edit;
            edit = Comment_edit.init({
              comment: this.comment,
              owner: this
            });
            return this.body.after(edit.render().el.hide().fadeIn());
          }, this));
      }
      return false;
    },
    toggleReply: function() {
      var reply, replying;
      replying = this.el.find('.content').first().find('.reply-ta').length;
      if (replying > 0) {
        replying = true;
      } else {
        replying = false;
      }
      switch (replying) {
        case true:
          return;
          this.el.find('.reply-ta').first().remove();
          break;
        case false:
          reply = Comment_reply.init({
            comment: this.comment,
            owner: this
          });
          this.controls.after(reply.render().el.hide().fadeIn());
      }
      return false;
    },
    renderBody: function() {
      return this.body.html(this.comment.commentContent);
    },
    render: function() {
      var html, unread;
      html = this.template.format(this.comment.creatorName, this.comment.creationDate, this.comment.commentContent);
      this.el.html(html);
      if (this.comment.creatorLoginName !== 'astanton') {
        this.el.find('.edit').remove();
        this.el.find('.delete').remove();
      }
      if (this.comment.unread) {
        unread = $(this.template_unread);
        this.el.find('.meta').after(unread);
      }
      this.el.attr('id', "sp-comment-" + this.comment.commentId);
      this.el.addClass('comment');
      this.refreshElements();
      return this;
    }
  });
  $(function() {
    var item, _i, _len, _results;
    Comments.init({
      el: $('#sp-comments')
    });
    _results = [];
    for (_i = 0, _len = TESTDATA.length; _i < _len; _i++) {
      item = TESTDATA[_i];
      _results.push(Comment.create(item));
    }
    return _results;
  });
}).call(this);
