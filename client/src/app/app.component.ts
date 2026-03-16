import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private socket!: WebSocket;
  messages: any[] = [];
  isConnected = false;

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object // Tiêm ID nền tảng vào đây
  ) { }

  ngOnInit() {
    // CHỈ CHẠY NẾU LÀ TRÌNH DUYỆT
    if (isPlatformBrowser(this.platformId)) {
      this.socket = new WebSocket('ws://localhost:3000');

      this.socket.onopen = () => {
        this.isConnected = true;
        this.cdr.detectChanges();
        console.log('✅ Connected to Server');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data); // Nhận { text: "...", isServer: true }
          this.messages.push(data);
        } catch (e) {
          // Phòng hờ nếu client khác gửi text thuần không phải JSON
          this.messages.push({ text: event.data, isServer: false });
        }
        this.cdr.detectChanges();
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.cdr.detectChanges();
        console.log('❌ Disconnected');
      };
    }
  }

  send(msg: string) {
    // Kiểm tra socket tồn tại trước khi gửi
    if (this.socket && msg.trim() && this.isConnected) {
      this.socket.send(msg);
    }
  }
}