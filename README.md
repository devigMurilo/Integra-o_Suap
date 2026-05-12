# Estudos Django REST + React

Repositório onde estou começando a estudar API com Django REST Framework e React.js. E ao final desse repositorio eu vou ter desenvolvido um projeto utilzando a  api do saup. utilizando esa api vou desenvolver o SUAP Analytics Dashboard, Plataforma web que transforma os dados do SUAP em insights visuais e análises inteligentes do desempenho acadêmico.

## Tecnologias

- Django REST Framework
- React.js
- Python
- JavaScript

## Como rodar

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # no Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## O que estou aprendendo

- Criar APIs REST com Django
- Consumir APIs com React
- Autenticação e autorização
- CRUD completo
- Integração frontend-backend

## Anotações

fetch()
faz a requisição

res.json()
transforma JSON em objeto JS

setAluno(data)
guarda os dados no React
