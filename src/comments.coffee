attrs = [
  'creationDate'
  'creatorName'
  'creatorLoginName'
  'commentTitle'
  'commentContent'
  'commentId'
  'unread'
  'commentNumber'
  'commentColor'
  'pageNumber'
  'pageHeight'
  'pageWidth'
  'replyTo'
]

Comment = Spine.Model.setup('Comment', attrs)

Comments = Spine.Controller.create
  proxied : ['addOne']
  init : () ->
    Comment.bind 'create', @addOne
  
  addOne : (comment) ->
    c = Comment_one.init { comment : comment }
    el = c.render().el

    # is a child?
    if comment.replyTo
      target = $("#sp-comment-#{comment.replyTo}")
      target.find('.child').first().append(el) if target.length
    else
      @el.append(el)

Comment_edit = Spine.Controller.create
  tag : 'div'
  template : '
    <div class="edit-ta">
      <textarea>{0}</textarea>
      <div class="controls">
        <button class="submit btn primary">Save</span>
        <button class="cancel btn">Cancel</span>
      </div>
    </div>
  ' 
  elements : 
    'textarea' : 'textarea'

  events :
    'click .submit' : 'submit'
    'click .cancel' : 'remove'

  submit : ->
    @comment.commentContent = @textarea.val()
    @comment.save()
    @remove()

  remove : ->
    @el.fadeOut((el)=>
      @owner.trigger('editRemoved', true)
    )
    
  render : ->
    html = @template.format(
      @comment.commentContent
    )
    @el.html html
    @refreshElements()

    @

Comment_reply = Spine.Controller.create
  tag : 'div'
  template : '
    <div class="reply-ta">
      <textarea></textarea>
      <div class="controls">
        <button class="submit btn primary">Post</span>
        <button class="cancel btn">Cancel</span>
      </div>
    </div>
  ' 
  elements : 
    'textarea' : 'textarea'
  events :
    'click .submit' : 'submit'
    'click .cancel' : 'remove'
  submit : ->
    @el.fadeOut(()=>
      comment = {
        creationDate: (new Date).getTime(),
        creatorName: "REPLYGUY",
        commentContent: @textarea.val(),
        commentId: "999",
        replyTo: @comment.commentId
      }
      Comment.create comment
    )

  remove : ->
    @el.fadeOut(()->
      $(@).remove()
    )

  render : ->
    @el.html @template
    @refreshElements()
    @    

Comment_one = Spine.Controller.create
  proxied : ['renderBody']
  tag : 'div'
  events : 
    'click .collapse' : 'collapse'
    'click .edit' : 'toggleEdit'
    'click .reply' : 'toggleReply'  
    'click .delete' : 'remove'
  elements : 
    '.collapse' : 'collapse'
    '.content' : 'content'
    '.controls' : 'controls'
    '.body' : 'body'

  template : '
    <div>
      <div>
        <span class="collapse">[-]</span>
        <span class="meta"> comment posted by <b>{0}</b> {1}</span>
      </div>
      <div class="content">
        <div class="body"> {2} </div>
        <div class="controls">
          <a href="#" class="edit action">Edit</a>
          <a href="#" class="reply action">Reply</a>
          <a href="#" class="delete action">Delete</a>
        </div>
        <div class="child"></div>
      </div>
    </div>
  '
  template_unread : '
    <span class="label success">New</span>
  '
  init : ->
    @comment.bind 'update', @renderBody

    @.bind 'editRemoved', @toggleEdit
      
  remove : ->
    remove = confirm('Are you sure?')
    @el.fadeOut() if remove
    false

  collapse : ->
    visible = @content.is(':visible')

    switch visible
      when true
        @content.slideUp()
        @collapse.html('[+]')
      when false
        @content.slideDown()
        @collapse.html('[-]')

    false
  toggleEdit : (removing) ->
    #possible memory leak in here
    editing = (removing == true) || false

    switch editing
      when true # exit edit mode
        @body.fadeIn()

      when false # enter edit mode
        @body.fadeOut(()=>
          edit = Comment_edit.init({ comment : @comment, owner : @ })
          @body.after(edit.render().el.hide().fadeIn())
        )

    false
    
  toggleReply : ->
    replying = @el.find('.content').first().find('.reply-ta').length

    if replying > 0 then replying = true else replying = false

    switch replying
      when true # exit reply mode
        return
        @el.find('.reply-ta').first().remove()

      when false # enter reply mode
        reply = Comment_reply.init({ comment : @comment, owner : @  })
        @controls.after(reply.render().el.hide().fadeIn())

    false

  renderBody : ->
    @body.html(@comment.commentContent)

  render : ->
    html = @template.format(
      @comment.creatorName
      @comment.creationDate
      @comment.commentContent
    )
    @el.html html

    # permissions
    if @comment.creatorLoginName != 'astanton'
      @el.find('.edit').remove()
      @el.find('.delete').remove()

    # unread notice
    if @comment.unread
      unread = $ @template_unread
      @el.find('.meta').after(unread)
      

    @el.attr 'id', "sp-comment-#{@comment.commentId}"
    @el.addClass 'comment'

    @refreshElements()
    @

$(() ->
  #comment_el = $('div').attr('id', 'comments')
  Comments.init({el : $('#sp-comments') })

  for item in TESTDATA
    Comment.create item

)
  
    

    

