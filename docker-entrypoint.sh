# Apply database migrations
echo "Apply database migrations"
python manage.py migrate

# Start server
echo "Starting server"
gunicorn --bind 0.0.0.0:8000 YetAnotherRecipeApp.wsgi