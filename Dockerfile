# Final runtime stage
FROM python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the Django project code
COPY . .


# Expose ports for HTTP and HTTPS (if you plan to use HTTPS)
EXPOSE 80
EXPOSE 443

# Set environment variable for OpenAI API key
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

# Collect static files
#RUN python manage.py collectstatic --no-input

# Start Gunicorn server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "YetAnotherRecipeApp.wsgi"]