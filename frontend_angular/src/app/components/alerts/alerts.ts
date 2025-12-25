import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';

interface Alert {
  type: string;
  severity: 'critica' | 'alta' | 'media' | 'baja';
  message: string;
  [key: string]: any;
}

interface SeverityConfig {
  bg: string;
  text: string;
  border: string;
  icon: string;
  badge: string;
  emoji: string;
  label: string;
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts.html',
  styleUrl: './alerts.css',
})
export class AlertsComponent implements OnInit {
  alerts = signal<Alert[]>([]);
  isOpen = signal(true);
  loading = signal(true);

  severityConfig: Record<Alert['severity'], SeverityConfig> = {
    critica: {
      bg: 'bg-gradient-to-r from-red-50 to-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      icon: 'text-red-500',
      badge: 'bg-red-500 text-white',
      emoji: '🚨',
      label: 'Crítica'
    },
    alta: {
      bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-300',
      icon: 'text-orange-500',
      badge: 'bg-orange-500 text-white',
      emoji: '⚠️',
      label: 'Alta'
    },
    media: {
      bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      icon: 'text-yellow-500',
      badge: 'bg-yellow-500 text-white',
      emoji: '⚡',
      label: 'Media'
    },
    baja: {
      bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
      icon: 'text-gray-500',
      badge: 'bg-gray-500 text-white',
      emoji: 'ℹ️',
      label: 'Baja'
    }
  };

  ngOnInit(): void {
    this.fetchAlerts();
  }

  fetchAlerts(): void {
    this.loading.set(true);
    fetch('http://localhost:5000/alerts', { cache: 'no-store' })
      .then(res => res.ok ? res.json() : { alerts: [] })
      .then(data => {
        this.alerts.set(data.alerts || []);
      })
      .catch(() => {
        this.alerts.set([]);
      })
      .finally(() => {
        this.loading.set(false);
      });
  }

  toggleAlerts(): void {
    this.isOpen.set(!this.isOpen());
  }

  closeAlerts(): void {
    this.isOpen.set(false);
  }
}
