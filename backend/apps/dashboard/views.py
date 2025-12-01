from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.db.models import Sum, Count
from apps.store.models import Order, Product
from apps.tournaments.models import Tournament, Team
from apps.users.models import User
from apps.payments.models import Payment

class DashboardOverviewView(views.APIView):
    """View for admin dashboard overview KPIs"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_revenue = Payment.objects.filter(status='succeeded').aggregate(Sum('amount'))['amount__sum'] or 0
        total_orders = Order.objects.count()
        total_users = User.objects.count()
        active_tournaments = Tournament.objects.filter(status='ongoing').count()
        
        recent_orders = Order.objects.order_by('-created_at')[:5].values(
            'id', 'order_number', 'total_amount', 'status', 'created_at'
        )
        
        return Response({
            'kpis': {
                'total_revenue': total_revenue,
                'total_orders': total_orders,
                'total_users': total_users,
                'active_tournaments': active_tournaments
            },
            'recent_orders': recent_orders
        })
