# Generated by Django 5.1.3 on 2024-11-27 09:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(choices=[('admin', 'Admin'), ('customer_manager', 'Customer Manager'), ('ticket_manager', 'Ticket Manager'), ('user', 'User'), ('asset_manager', 'Asset_Manager'), ('warehouse_manager', 'Warehouse_Manager'), ('finance_manager', 'Finance_Manager') , ('third_party', 'Third Party')], default='user', max_length=20),
        ),
    ]
