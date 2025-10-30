#!/bin/bash
# Script temporal para agregar navigation metadata a manifests

# Staff - ya tiene UserGroupIcon importado
echo "Updating staff manifest..."
cat > temp_staff_nav.txt << 'EOF'
    navigation: {
      route: '/admin/staff',
      icon: UsersIcon,
      color: 'indigo',
      domain: 'resources',
      isExpandable: false
    }
EOF

# Scheduling - ya tiene CalendarIcon importado
echo "Updating scheduling manifest..."
cat > temp_scheduling_nav.txt << 'EOF'
    navigation: {
      route: '/admin/scheduling',
      icon: CalendarIcon,
      color: 'violet',
      domain: 'resources',
      isExpandable: false
    }
EOF

# Sales - tiene ChartBarIcon pero necesitamos CurrencyDollarIcon
echo "Updating sales manifest..."
cat > temp_sales_nav.txt << 'EOF'
    navigation: {
      route: '/admin/sales',
      icon: CurrencyDollarIcon,
      color: 'teal',
      domain: 'operations',
      isExpandable: false
    }
EOF

echo "Navigation metadata prepared. Apply manually to manifests."
