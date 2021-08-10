from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponseRedirect, HttpResponse
from . import util
import markdown2

md = markdown2.Markdown()

def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

def entry_page(request, title):
    content = util.get_entry(title)
    if content is not None:
        #converts the markdown content into html
        content = md.convert(content)
        return render(request, 'encyclopedia/entry_page.html', {'content': content, 'title': title})

    else:
        return render(request, 'encyclopedia/error.html', {'message': 'Requested page not found'})

def search(request):
    if request.method == 'POST':
        title = request.POST['q']
        #Store entries in a list
        entries = []
        for i in util.list_entries():
            entries.append(i)

        for entry in entries:
            if entry == title:
                return HttpResponseRedirect(reverse('entry_page', args=(title,)))
        else:
            results = []
            for i in entries:  #select each item in the entry list
                if i.find(title) != -1:  #check if search item in each title
                    results.append(i)  #stores the entry in the result list if matching with title
            context = {
                'results': results,
                'title': title
            }
            return render(request, 'encyclopedia/search_result.html', context)

def create_new(request):
    if request.method == "POST":
        title = request.POST['title']
        content = request.POST['content']

        if title in util.list_entries():
            return render(request, 'encyclopedia/error.html', {'message': 'Title already exists'})
        else:
            util.save_entry(title, content)
            return HttpResponseRedirect(reverse('entry_page', args=(title,)))

    return render(request, 'encyclopedia/create_new.html')

def edit(request, title):
    if request.method == "POST":
        content = request.POST["content"]
        util.save_entry(title, content)
        return HttpResponseRedirect(reverse('entry_page', args=(title,)))

    else:
        content = util.get_entry(title)
        return render(request, 'encyclopedia/edit.html', {'title': title, 'content': content})

def random(request):
    import random as r
    filenames = util.list_entries()
    entries = []
    #stores the name of all the entries in a list
    for filename in filenames:
        entries.append(filename)

    #Get a random number within the range of the list
    x_num = r.randrange(len(entries))
    title = entries[x_num]
    return HttpResponseRedirect(reverse('entry_page', args=(title,)))
