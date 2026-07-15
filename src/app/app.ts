import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  submenuTecnicoAberto: boolean = false;
  menuMinimizado: boolean = false;
  isLoginRoute: boolean = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLoginRoute = event.urlAfterRedirects.includes('/login');
    });
  }

  toggleSubmenu(): void {
    this.submenuTecnicoAberto = !this.submenuTecnicoAberto;
  }

  toggleMenuLateral(): void {
    this.menuMinimizado = !this.menuMinimizado;
  }

  sair(): void {
    this.authService.logout();
  }

  getIniciais(): string {
    const nome = this.authService.getUserName().trim();
    if (!nome || nome === 'Pescador(a)') return 'PR';

    const partes = nome.split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();

    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }
}
