import app from './app'

app.listen(app.get('port'), () => {
    console.log(`${app.get('title')} corriendo en el puerto ${app.get('port')}`)
})