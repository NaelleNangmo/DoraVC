'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Eye } from 'lucide-react';

interface AdminDashboardStatsProps {
  posts: {
    id: number;
    userId: number;
    userName: string;
    userAvatar: string;
    title: string;
    content: string;
    image?: string;
    status: 'pending' | 'approved' | 'rejected';
    countryId?: number;
    countryName?: string;
    rating?: number;
    createdAt: string;
    approvedAt?: string;
    tags: string[];
    likes: number;
    comments: number;
    views?: number;
  }[];
  users: {
    id: number;
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    avatar?: string;
    joinedDate?: string;
    preferences?: {
      language: string;
      currency: string;
    };
  }[];
  adminCountries: any[];
}

export default function AdminDashboardStats({ posts, users, adminCountries }: AdminDashboardStatsProps) {
  const chartRef1 = useRef<HTMLCanvasElement>(null); // Utilisateurs par devise
  const chartRef2 = useRef<HTMLCanvasElement>(null); // Posts par statut
  const chartRef3 = useRef<HTMLCanvasElement>(null); // Vues par post
  const chartInstance1 = useRef<Chart | null>(null);
  const chartInstance2 = useRef<Chart | null>(null);
  const chartInstance3 = useRef<Chart | null>(null);

  useEffect(() => {
    // Graphique 1 : Utilisateurs par devise
    const ctx1 = chartRef1.current?.getContext('2d');
    if (ctx1 && users.length > 0) {
      if (chartInstance1.current) chartInstance1.current.destroy();

      const currencyCounts = users.reduce((acc, user) => {
        const currency = user.preferences?.currency || 'N/A';
        acc[currency] = (acc[currency] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      chartInstance1.current = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: Object.keys(currencyCounts),
          datasets: [{
            data: Object.values(currencyCounts),
            backgroundColor: ['#4B6CB7', '#6D9DC5', '#A3BFFA'],
            borderColor: '#FFFFFF',
            borderWidth: 2,
            hoverOffset: 10,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#2563EB',
                font: { size: 14 }
              }
            },
            title: {
              display: true,
              text: 'Répartition des utilisateurs par devise',
              color: '#2563EB',
              font: { size: 18 }
            },
            tooltip: {
              backgroundColor: '#FFFFFF',
              titleColor: '#2563EB',
              bodyColor: '#1E40AF',
              borderColor: '#2563EB',
              borderWidth: 1
            }
          },
          animation: {
            animateRotate: true,
            animateScale: true
          }
        },
      });
    }

    // Graphique 2 : Posts par statut
    const ctx2 = chartRef2.current?.getContext('2d');
    if (ctx2 && posts.length > 0) {
      if (chartInstance2.current) chartInstance2.current.destroy();

      const statusCounts = posts.reduce((acc, post) => {
        acc[post.status] = (acc[post.status] || 0) + 1;
        return acc;
      }, {} as Record<'pending' | 'approved' | 'rejected', number>);

      chartInstance2.current = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: ['En attente', 'Approuvés', 'Rejetés'],
          datasets: [{
            label: 'Nombre de posts',
            data: [
              statusCounts['pending'] || 0,
              statusCounts['approved'] || 0,
              statusCounts['rejected'] || 0
            ],
            backgroundColor: ['#4B6CB7', '#60A5FA', '#93C5FD'],
            borderColor: '#2563EB',
            borderWidth: 2,
            barThickness: 20,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Nombre',
                color: '#2563EB',
                font: { size: 14 }
              },
              ticks: {
                color: '#1E40AF'
              },
              grid: {
                color: 'rgba(37, 99, 235, 0.1)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Statut des posts',
                color: '#2563EB',
                font: { size: 14 }
              },
              ticks: {
                color: '#1E40AF'
              },
              grid: {
                color: 'rgba(37, 99, 235, 0.1)'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: '#2563EB',
                font: { size: 14 }
              }
            },
            title: {
              display: true,
              text: 'Distribution des posts par statut',
              color: '#2563EB',
              font: { size: 18 }
            },
            tooltip: {
              backgroundColor: '#FFFFFF',
              titleColor: '#2563EB',
              bodyColor: '#1E40AF',
              borderColor: '#2563EB',
              borderWidth: 1
            }
          },
          animation: {
            duration: 2000,
            easing: 'easeInOutQuad'
          }
        },
      });
    }

    // Graphique 3 : Vues par post
    const ctx3 = chartRef3.current?.getContext('2d');
    if (ctx3 && posts.length > 0) {
      if (chartInstance3.current) chartInstance3.current.destroy();

      chartInstance3.current = new Chart(ctx3, {
        type: 'line',
        data: {
          labels: posts.map(post => post.title),
          datasets: [{
            label: 'Vues',
            data: posts.map(post => post.views || 0),
            backgroundColor: 'rgba(75, 108, 183, 0.2)',
            borderColor: '#4B6CB7',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#2563EB',
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Nombre de vues',
                color: '#2563EB',
                font: { size: 14 }
              },
              ticks: {
                color: '#1E40AF'
              },
              grid: {
                color: 'rgba(37, 99, 235, 0.1)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Posts',
                color: '#2563EB',
                font: { size: 14 }
              },
              ticks: {
                color: '#1E40AF'
              },
              grid: {
                color: 'rgba(37, 99, 235, 0.1)'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: '#2563EB',
                font: { size: 14 }
              }
            },
            title: {
              display: true,
              text: 'Vues par post',
              color: '#2563EB',
              font: { size: 18 }
            },
            tooltip: {
              backgroundColor: '#FFFFFF',
              titleColor: '#2563EB',
              bodyColor: '#1E40AF',
              borderColor: '#2563EB',
              borderWidth: 1
            }
          },
          animation: {
            duration: 2000,
            easing: 'easeInOutQuad'
          }
        },
      });
    }

    return () => {
      if (chartInstance1.current) chartInstance1.current.destroy();
      if (chartInstance2.current) chartInstance2.current.destroy();
      if (chartInstance3.current) chartInstance3.current.destroy();
    };
  }, [users, posts]);

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 dark:bg-blue-800/80 backdrop-blur-sm border border-blue-200/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Répartition des utilisateurs par devise
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <canvas ref={chartRef1} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-blue-800/80 backdrop-blur-sm border border-blue-200/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Distribution des posts par statut
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <canvas ref={chartRef2} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-blue-800/80 backdrop-blur-sm border border-blue-200/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Vues par post
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <canvas ref={chartRef3} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}