import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/lib/services';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsService.getDashboardMetrics(),
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useRevenueByPeriod(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['analytics', 'revenue', startDate, endDate],
    queryFn: () => analyticsService.getRevenueByPeriod(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

export function useTopProducts(limit = 10) {
  return useQuery({
    queryKey: ['analytics', 'top-products', limit],
    queryFn: () => analyticsService.getTopProducts(limit),
  });
}

export function useOrdersByStatus() {
  return useQuery({
    queryKey: ['analytics', 'orders-by-status'],
    queryFn: () => analyticsService.getOrdersByStatus(),
  });
}
