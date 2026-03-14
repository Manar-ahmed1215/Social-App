import { MyProfileDetails } from './../../../../../core/models/my-profile-details.interface';
import { Component, inject, Input, OnInit } from '@angular/core';
import { CommentsService } from './comments.service';
import { Comments } from './comments.interface';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { UserDetails } from '../../../../../core/models/user-details.interface';
import { TimeAgoPipe } from '../../../../../shared/pipes/time-ago-pipe';
import { NgClass } from '@angular/common';
import { ProfileService } from '../../../../../core/services/profile.service';

@Component({
  selector: 'app-post-comment',
  imports: [ReactiveFormsModule, TimeAgoPipe, FormsModule, NgClass],
  templateUrl: './post-comment.component.html',
  styleUrl: './post-comment.component.css',
})
export class PostCommentComponent implements OnInit {
  private readonly commentsService = inject(CommentsService)
  private readonly profileService = inject(ProfileService)
  @Input() postId: string = ""
  commentsList: Comments[] = []
  commentRepliesList: { [key: string]: Comments[] } = {}
  myPostsId: string[] = []
  content: FormControl = new FormControl()
  replyContentControl: FormControl = new FormControl();
  imageUrl: string | ArrayBuffer | null | undefined
  editImgUrl: string | ArrayBuffer | null | undefined;
  saveFile!: File
  loading: boolean = true;
  loadingCreateComent: boolean = false
  loadingCreateReply: boolean = false
  loadingReplyComments: { [key: string]: boolean } = {};
  selectedImage: string | null = null;
  userId: string = ""
  userData!: UserDetails;
  menuStates: { [key: string]: boolean } = {}
  loadingDelete: boolean = false
  editingCommentId: string | null = null;
  editedContent: string = '';
  replyFormStates: { [key: string]: boolean } = {};
  replyImage: { [key: string]: string | ArrayBuffer | null } = {};
  loadingLike: { [key: string]: boolean } = {};
  isLiked: { [key: string]: boolean } = {};
  loadingEdite: boolean = false
  page: number = 1;
  limit: number = 10;
  isLoadingMore: boolean = false;
  allCommentsLoaded: boolean = false;
  getAllComments: number = 0
  isEndComments:boolean=false


  ngOnInit(): void {
    const data = localStorage.getItem('userData');
    if (data) {
      this.userData = JSON.parse(data);
    }

    this.userId = JSON.parse(localStorage.getItem("userData")!)?._id;
    this.getCommentPost();
    this.profileService.getUserPosts(this.userData._id).subscribe({
      next: (res) => {
        console.log("prof")
        console.log(res)
        console.log("prof")
        for (const post of res.data.posts) {
          this.myPostsId.push(post._id);
        }

        console.log(this.myPostsId);
      }
    })
  }

  getCommentPost(): void {
    if (this.isLoadingMore || this.allCommentsLoaded) return;

    this.isLoadingMore = true;
    this.commentsService.getAllComments(this.postId, this.page, this.limit).subscribe({
      next: (res) => {
        this.getAllComments=res.meta.pagination.total
        const newComments = res.data.comments;
        for (let comment of newComments) {
          this.commentsList.push(comment);
        }

        if (newComments.length < this.limit) {
          this.allCommentsLoaded = true;
        }
        if(this.commentsList.length === this.getAllComments){
          this.isEndComments=true
        }
        

        this.page++;
        this.isLoadingMore = false;  
        this.loading = false;       
      },
      error: (err) => {
        console.log(err);
        this.isLoadingMore = false;
        this.loading = false;
      }
    });
  }
  onScroll(event: any) {
    const element = event.target;
    if (
      element.scrollHeight - element.scrollTop <= element.clientHeight + 5 &&
      !this.isLoadingMore &&
      !this.allCommentsLoaded
    ) {
      this.getCommentPost();
    }
  }

  selectImage(e: Event, commentId?: string): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.saveFile = input.files[0];

      const fileReader = new FileReader();
      fileReader.readAsDataURL(this.saveFile);
      fileReader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result;
        if (commentId) {
          this.replyImage[commentId] = result as string;
        } else {
          this.imageUrl = result;
        }
      };
    }
  }

  showFile(): void {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(this.saveFile)
    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      this.imageUrl = e.target?.result
    }

  }

  submitForm(e: Event, form: HTMLFormElement): void {
    e.preventDefault()
    this.loadingCreateComent = true

    if (!this.content.value && !this.saveFile) {
      return
    }

    const formData = new FormData()
    if (this.content.value) {
      formData.append("content", this.content.value)
    }
    if (this.saveFile) {
      formData.append("image", this.saveFile)
    }


    this.commentsService.createComment(this.postId, formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.commentsList.push(res.data.comment);
          this.commentsList = this.commentsList.slice();

          form.reset()
          this.content.reset()
          this.imageUrl = ""
          this.loadingCreateComent = false
        }
      },
      error: (err) => {
        console.log(err)
      }
    })
  }
  deleteComment(commentId: string, postId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this comment?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadingDelete = true
        this.commentsService.deleteComment(commentId, postId).subscribe({
          next: (res) => {
            console.log('Delete response:', res);

            let isReply = false;
            for (const parentId in this.commentRepliesList) {
              const len = this.commentRepliesList[parentId].length;

              this.commentRepliesList[parentId] = this.commentRepliesList[parentId].filter(r => r._id !== commentId);

              if (this.commentRepliesList[parentId].length < len) {
                isReply = true;

                const parentComment = this.commentsList.find(c => c._id === parentId);
                if (parentComment) {
                  parentComment.repliesCount--;
                }
                break;
              }
            }

            if (!isReply) {
              this.commentsList = this.commentsList.filter(c => c._id !== commentId);
            }
            const parentComment = this.commentsList.find(c => c._id === postId);
            if (parentComment && parentComment.repliesCount > 0) {
              parentComment.repliesCount--;
            }
            Swal.fire(
              'Deleted!',
              'Your comment has been deleted.',
              'success'
            )
            this.loadingDelete = false
          },
          error: (err) => {
            console.log(err);
            Swal.fire(
              'Error!',
              'Something went wrong while deleting the comment.',
              'error'
            )
          }
        });
      }
    })
  }


  openMenu(commentId: string) {
    this.menuStates[commentId] = !this.menuStates[commentId]
  }

  isMenuOpen(commentId: string): boolean {
    return !!this.menuStates[commentId]
  }
  openImage(imgUrl: string) {
    this.selectedImage = imgUrl;
  }

  closeImage() {
    this.selectedImage = null;
  }


  setDataEdit(comment: Comments): void {
    this.editingCommentId = comment._id
    this.editedContent = comment.content || ''
    this.editImgUrl = comment.image || ''
  }
  updateComment(commentId: string) {
    this.loadingEdite = true
    if (!this.editedContent && !this.saveFile) return;

    const formData = new FormData();
    formData.append('content', this.editedContent);
    if (this.saveFile) formData.append('image', this.saveFile);

    this.commentsService.updateComment(commentId, this.postId, formData).subscribe({
      next: (res) => {
        if (res.success) {
          // edite comment
          const commentIndex = this.commentsList.findIndex(c => c._id === commentId);
          if (commentIndex !== -1) {
            this.commentsList[commentIndex] = res.data.comment;
          }

          // edite reply
          for (const parentId in this.commentRepliesList) {
            const replyIndex = this.commentRepliesList[parentId].findIndex(r => r._id === commentId);
            if (replyIndex !== -1) {
              this.commentRepliesList[parentId][replyIndex] = res.data.comment;
              this.commentRepliesList[parentId] = [...this.commentRepliesList[parentId]];
            }
          }

          this.editingCommentId = null;
          this.editedContent = '';
          this.editImgUrl = undefined;
          this.saveFile = undefined!;
        }
        this.loadingEdite = false
      },
      error: (err) => {
        console.log(err)
        this.loadingEdite = false
      }
    });
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.editedContent = '';
    this.editImgUrl = "";
    this.saveFile = undefined!;
  }

  getRepliesComments(postId: string, commentId: string): void {
    this.loadingReplyComments[commentId] = true
    this.commentsService.getRepliesComments(postId, commentId).subscribe({
      next: (res) => {
        this.commentRepliesList[commentId] = res.data.replies
        this.loadingReplyComments[commentId] = false
      },
      error: (err) => {
        console.log(err)
        this.loadingReplyComments[commentId] = false
      }
    })
  }
  toggleReplyForm(commentId: string) {
    this.replyFormStates[commentId] = !this.replyFormStates[commentId];
    if (!this.replyFormStates[commentId]) {
      this.commentRepliesList[commentId] = [];
    }
  }

  submiteReplyComment(e: Event, form: HTMLFormElement, commentId: string, postId: string): void {
    e.preventDefault();
    this.loadingCreateReply = true;
    if (!this.replyContentControl.value && !this.saveFile) return;

    const formData = new FormData();
    if (this.replyContentControl.value) {
      formData.append('content', this.replyContentControl.value);
    }
    if (this.saveFile) {
      formData.append('image', this.saveFile);
    }

    this.commentsService.createReplyComment(postId, commentId, formData).subscribe({
      next: (res) => {
        if (res.success) {
          if (!this.commentRepliesList[commentId]) {
            this.commentRepliesList[commentId] = [];
          }
          this.commentRepliesList[commentId].push(res.data.reply);
          this.commentRepliesList[commentId] = this.commentRepliesList[commentId].slice();
          const parentComment = this.commentsList.find(c => c._id === commentId);
          if (parentComment) {
            parentComment.repliesCount++;
          }
          form.reset();
          this.replyContentControl.reset();
          this.replyImage[commentId] = null;
          this.saveFile = undefined!;
          this.loadingCreateReply = false;
        }
      },
      error: (err) => {
        console.log(err);
        this.loadingCreateComent = false;
      }
    });
  }

  likeOrUnlikeComment(commentId: string, postId: string) {
    this.loadingLike[commentId] = true;

    this.commentsService.likeOrUnlikeComment(commentId, postId).subscribe({
      next: (res) => {
        const isLiked = res.data.liked;

        // update comments
        for (let comment of this.commentsList) {
          if (comment._id === commentId) {
            if (isLiked) {
              if (!comment.likes.includes(this.userId)) comment.likes.push(this.userId);
            } else {
              const index = comment.likes.indexOf(this.userId);
              if (index > -1) comment.likes.splice(index, 1);
            }
            break;
          }
        }

        // update replies
        for (const parentId in this.commentRepliesList) {
          const replies = this.commentRepliesList[parentId];
          for (let reply of replies) {
            if (reply._id === commentId) {
              if (isLiked) {
                if (!reply.likes.includes(this.userId)) reply.likes.push(this.userId);
              } else {
                const index = reply.likes.indexOf(this.userId);
                if (index > -1) reply.likes.splice(index, 1);
              }

              this.commentRepliesList[parentId] = [...replies];
              break;
            }
          }
        }

        this.isLiked[commentId] = isLiked;
        this.loadingLike[commentId] = false;
        this.commentsList = [...this.commentsList];
      },
      error: (err) => {
        console.error(err);
        this.loadingLike[commentId] = false;
      }
    });
  }

}

