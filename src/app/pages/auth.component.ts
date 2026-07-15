import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecaptchaModule } from 'ng-recaptcha';
import { AuthService } from '../core/services/auth/auth.service';

type TelaAuth = 'LOGIN' | 'REGISTRO' | 'VERIFICAR_CONTA' | 'ESQUECI_SENHA' | 'NOVA_SENHA';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RecaptchaModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden bg-neo-paper">

      <div class="absolute inset-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjRjdGMEU2Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMUQyQjFGIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwLjA1Ij48L3BhdGg+Cjwvc3ZnPg==')] pointer-events-none"></div>

      <div class="neo-card w-full max-w-md p-8 relative z-30 animate-fade-in bg-white">

        <div class="flex flex-col items-center mb-8 border-b-[3px] border-neo-ink pb-6">
          <h1 class="text-4xl font-serif font-black text-neo-ink tracking-tighter">Pesca<span class="text-neo-lime" style="text-shadow: 1px 1px 0px #1D2B1F, -1px -1px 0px #1D2B1F, 1px -1px 0px #1D2B1F, -1px 1px 0px #1D2B1F;">Brasil</span></h1>
          <p class="text-neo-ink font-bold text-sm mt-2 tracking-widest uppercase">Compartilhe suas fisgadas</p>
        </div>

        <div *ngIf="mensagem" [ngClass]="sucesso ? 'bg-neo-lime' : 'bg-neo-rust text-white'" class="p-4 border-[3px] border-neo-ink text-sm font-bold text-center mb-6 animate-scale-up uppercase tracking-wide rounded-xl shadow-[4px_4px_0px_0px_#1D2B1F]">
          {{ mensagem }}
        </div>

        <form *ngIf="telaAtual === 'LOGIN' || telaAtual === 'REGISTRO'" [formGroup]="authForm" (ngSubmit)="submitAuthForm()" class="flex flex-col gap-5 animate-fade-in">

          <div *ngIf="telaAtual === 'REGISTRO'" class="animate-fade-in">
            <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">Nome Completo</label>
            <input type="text" formControlName="name" placeholder="Ex: João da Silva" class="neo-input">
          </div>

          <div>
            <label class="block text-sm font-black text-neo-ink uppercase tracking-wider mb-2">E-mail</label>
            <input type="email" formControlName="email" placeholder="pescador@exemplo.com" class="neo-input">
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-black text-neo-ink uppercase tracking-wider">Senha</label>
              <button *ngIf="telaAtual === 'LOGIN'" type="button" (click)="mudarTela('ESQUECI_SENHA')" class="text-xs text-neo-rust font-black uppercase hover:underline transition-colors">Esqueceu a senha?</button>
            </div>

            <div class="relative">
              <input [type]="senhaVisivel ? 'text' : 'password'" formControlName="password" placeholder="••••••••" class="neo-input pr-12">
              <button type="button" (click)="toggleSenhaVisivel()" class="absolute inset-y-0 right-0 pr-4 flex items-center text-neo-ink focus:outline-none">
                <svg *ngIf="!senhaVisivel" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                <svg *ngIf="senhaVisivel" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
              </button>
            </div>
          </div>

          <div class="flex justify-center my-2">
            <re-captcha siteKey="6LfIKUAtAAAAAMF43nNxSPc5Q7YJV7jkH2TZrAYZ" (resolved)="onCaptchaResolvido($event)"></re-captcha>
          </div>

          <button type="submit" [disabled]="authForm.invalid || carregando || !recaptchaToken" class="neo-btn w-full mt-2">
            {{ carregando ? 'Aguarde...' : (telaAtual === 'REGISTRO' ? 'Criar Conta' : 'Entrar na Plataforma') }}
          </button>
        </form>

        <div *ngIf="telaAtual === 'LOGIN' || telaAtual === 'REGISTRO'" class="mt-8 text-center text-sm font-bold text-neo-ink bg-neo-paper p-4 rounded-xl border-[3px] border-neo-ink">
          {{ telaAtual === 'REGISTRO' ? 'Já tem uma conta?' : 'Ainda não é registrado?' }}<br>
          <button type="button" (click)="mudarTela(telaAtual === 'REGISTRO' ? 'LOGIN' : 'REGISTRO')" class="text-neo-rust font-black uppercase mt-1 hover:underline">
            {{ telaAtual === 'REGISTRO' ? 'Faça login aqui' : 'Crie sua conta agora' }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleUp { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
    .animate-scale-up { animation: scaleUp 0.2s ease-out forwards; }
  `]
})
export class AuthComponent implements OnInit{

  telaAtual: TelaAuth = 'LOGIN';

  authForm: FormGroup;
  otpForm: FormGroup;
  forgotPasswordForm: FormGroup;
  resetPasswordForm: FormGroup;

  carregando = false;
  mensagem = '';
  sucesso = false;
  senhaVisivel = false;
  emailDeTrabalho = '';
  recaptchaToken: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    this.authForm = this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.pattern(emailRegex)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(passwordRegex)]]
    });

    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(emailRegex)]]
    });

    this.resetPasswordForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(passwordRegex)]]
    });
  }

  ngOnInit(): void {
    this.authService.limparSessao();
  }

  toggleSenhaVisivel(): void { this.senhaVisivel = !this.senhaVisivel; }

  onCaptchaResolvido(token: string | null): void {
    this.recaptchaToken = token;
  }

  mudarTela(novaTela: TelaAuth): void {
    this.telaAtual = novaTela;
    this.mensagem = '';
    this.sucesso = false;
    this.recaptchaToken = null;

    const nameControl = this.authForm.get('name');
    if (this.telaAtual === 'REGISTRO') {
      nameControl?.setValidators([Validators.required]);
    } else {
      nameControl?.clearValidators();
    }
    nameControl?.updateValueAndValidity();

    this.authForm.reset();
    this.otpForm.reset();
    this.forgotPasswordForm.reset();
    this.resetPasswordForm.reset();
  }

  tratarErro(err: any, msgPadrao: string): void {
    this.carregando = false;
    this.sucesso = false;
    this.recaptchaToken = null;

    try {
      if (err && err.error && typeof err.error === 'string') {
        this.mensagem = err.error;
      } else {
        this.mensagem = msgPadrao;
      }
    } catch (e) {
      this.mensagem = 'Ocorreu um erro de comunicação.';
    }
    this.cdr.detectChanges();
  }

  submitAuthForm(): void {
    if (this.authForm.invalid || !this.recaptchaToken) return;

    this.carregando = true;
    this.mensagem = '';

    if (this.telaAtual === 'REGISTRO') {
      const payloadRegistro = {
        ...this.authForm.value,
        recaptchaToken: this.recaptchaToken
      };

      this.authService.register(payloadRegistro).subscribe({
        next: () => {
          this.sucesso = true;
          this.mensagem = 'Quase lá! Verifique sua caixa de entrada.';
          this.emailDeTrabalho = this.authForm.get('email')?.value;
          this.mudarTela('VERIFICAR_CONTA');
          this.carregando = false;
          this.cdr.detectChanges();
        },
        error: (err) => this.tratarErro(err, 'Erro ao criar conta. Verifique os dados.')
      });
    } else {
      const payloadLogin = {
        email: this.authForm.value.email,
        password: this.authForm.value.password,
        recaptchaToken: this.recaptchaToken
      };

      this.authService.login(payloadLogin).subscribe({
        next: () => {
          this.carregando = false;
          this.router.navigate(['/mapa']);
        },
        error: (err) => this.tratarErro(err, 'Credenciais inválidas ou conta não ativada.')
      });
    }
  }

  submitVerificacaoConta(): void {
    if (this.otpForm.invalid) return;
    this.carregando = true;

    this.authService.verify({ email: this.emailDeTrabalho, code: this.otpForm.get('code')?.value }).subscribe({
      next: () => {
        this.sucesso = true;
        this.mensagem = 'Conta ativada com sucesso! Você já pode entrar.';
        this.mudarTela('LOGIN');
        this.authForm.patchValue({ email: this.emailDeTrabalho });
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => this.tratarErro(err, 'Código inválido. Tente novamente.')
    });
  }

  submitEsqueciSenha(): void {
    if (this.forgotPasswordForm.invalid) return;
    this.carregando = true;
    this.emailDeTrabalho = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword({ email: this.emailDeTrabalho }).subscribe({
      next: () => {
        this.sucesso = true;
        this.mensagem = 'Código enviado! Verifique seu e-mail.';
        this.mudarTela('NOVA_SENHA');
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => this.tratarErro(err, 'Erro ao solicitar recuperação. E-mail não encontrado.')
    });
  }

  submitNovaSenha(): void {
    if (this.resetPasswordForm.invalid) return;
    this.carregando = true;

    const payload = {
      email: this.emailDeTrabalho,
      code: this.resetPasswordForm.get('code')?.value,
      newPassword: this.resetPasswordForm.get('newPassword')?.value
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.sucesso = true;
        this.mensagem = 'Senha alterada com sucesso! Faça login.';
        this.mudarTela('LOGIN');
        this.authForm.patchValue({ email: this.emailDeTrabalho });
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => this.tratarErro(err, 'Erro ao redefinir a senha. Código inválido ou expirado.')
    });
  }
}
