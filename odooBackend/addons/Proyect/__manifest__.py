{
    'name': 'Proyect',
    'version': '1.0.0',
    'summary': 'Modulo base Proyect',
    'description': 'Estructura inicial del modulo Proyect.',
    'author': 'Wilkins',
    'category': 'Tools',
    'license': 'LGPL-3',
    'depends': ['base', 'product', 'website'],
    'data': [
        'security/ir.model.access.csv',
        'views/users_views.xml',
    ],
    'installable': True,
    'application': True,
}
