import { Component, HostListener, inject, OnInit } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.interface';
import { NgClass } from '@angular/common';
import { Router } from "@angular/router";

@Component({
  selector: 'app-notifications',
  imports: [NgClass ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService)
  private readonly router = inject(Router)

  notificationList: Notification[] = [];
  filteredNotifications: Notification[] = [];
  filter: "all" | "unread" = "all"
  unreadCount: number = 0
  page: number = 1;
  limit: number = 10;
  isLoadingMore: boolean = false;
  allNotificationsLoaded: boolean = false;
  ngOnInit(): void {
    this.getAllNotification()
    this.getUnreadCount()
  }
  getAllNotification(): void {
    if (this.isLoadingMore || this.allNotificationsLoaded) return;

    this.isLoadingMore = true;
    this.notificationService.getNotification(this.page, this.limit).subscribe({
      next: (res) => {
        const newNotifications = res.data.notifications;
        for (let notif of newNotifications) {
          this.notificationList.push(notif);
        }
        this.filters();

        if (newNotifications.length < this.limit) {
          this.allNotificationsLoaded = true;
        } else {
          this.page++;
        }
        this.isLoadingMore = false;
        console.log('this.notificationList')
        console.log(this.notificationList)
      },
      error: (err) => {
        console.error(err);
        this.isLoadingMore = false;
      }
    });
  }

  getUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount = res.data.unreadCount
        console.log(res.data.unreadCount)

      }
    })
  }

  filters(): void {
    if (this.filter === 'all') {
      this.filteredNotifications = [...this.notificationList];
    }
    else if (this.filter === 'unread') {
      this.filteredNotifications = this.notificationList.filter(noti => !noti.isRead);
    }
  }
  showAllNotifications(): void {
    this.filter = 'all';
    this.filters();
  }

  showUnreadNotifications(): void {
    this.filter = 'unread';
    this.filters();
  }

  readSingleNotification(notificationId: string): void {

    this.notificationService.readSingleNotification(notificationId).subscribe({
      next: (res) => {

        const notif = this.notificationList.find(n => n._id === notificationId);
        if (notif) {
          notif.isRead = true;
        }
        this.unreadCount--;
        this.filters();

      }
    });

  }
  readAll():void{
    this.notificationService.readAll().subscribe({
      next:(res)=>{
        this.notificationList.forEach(noti => noti.isRead = true);
      this.unreadCount = 0; 
      this.filters();
      }
    })
  }



  @HostListener('window:scroll', [])
  onWindowScroll() {

    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.body.offsetHeight;

    if (
      scrollPosition >= pageHeight - 10 &&
      !this.isLoadingMore &&
      !this.allNotificationsLoaded
    ) {
      this.getAllNotification();
    }

  }

  goToProfile(actorId: string, event: Event) {
  event.stopPropagation();
  this.router.navigate(['/profile', actorId]);
}

markAsRead(notificationId: string, event: Event) {
  event.stopPropagation();
  this.readSingleNotification(notificationId);
}

goToDetails(item: Notification) {
  if (item.entityType === "post") {
    if (item.entity.unavailable) {
      this.router.navigate(['/details', 'unavailable']);
    } else {
      this.router.navigate(['/details', item.entityId]);
    }
  } else {
    console.log('This notification is not a post, no navigation.');
  }
}
}
