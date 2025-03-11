var builder = WebApplication.CreateBuilder(args);

// Adiciona os serviços necessários para os controllers
builder.Services.AddControllers();

// Adiciona o Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// **Mapeia os controllers após registrar os serviços**
app.MapControllers();

app.Run();
