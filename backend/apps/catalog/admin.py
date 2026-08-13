from django.contrib import admin
from .models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_featured', 'is_active', 'created_at']
    list_filter = ['category', 'is_featured', 'is_active']
    search_fields = ['name', 'short_description']
    list_editable = ['is_featured', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
