from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:title>", views.entry_page, name="entry_page"),
    path("search", views.search, name="search"),
    path("create_new", views.create_new, name="create_new"),
    path("edit/<str:title>", views.edit, name="edit"),
    path("random", views.random, name="random"),
]
