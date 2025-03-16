using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PessoasApi.Context;
using PessoasApi.Models;

namespace PessoasApi.Services
{
    public class PessoaService
    {
        private readonly PessoasContext _context;
        public PessoaService(PessoasContext context){
            _context = context;
        }

        public List<Pessoa> ListarTodas(){
            return _context.Pessoas.ToList();
        }

        public Pessoa ObterPorId(int id){
            return _context.Pessoas.FirstOrDefault(p => p.Id == id);
        }

        public void Adicionar(Pessoa pessoa){
            _context.Pessoas.Add(pessoa);
            _context.SaveChanges();
        }

        public void Atualziar(Pessoa pessoa){
            _context.Pessoas.Update(pessoa);
            _context.SaveChanges();
        }

        public void Remover(int id){ //por enquanto exclusao física, depois alterar para lógica
            var pessoa = _context.Pessoas.Find(id);
            if (pessoa != null)
            {
                _context.Pessoas.Remove(pessoa);
                _context.SaveChanges();
            }
        }


        public bool TestarConexao()
        {
            try
            {
                _context.Database.OpenConnection(); // Força abertura da conexão
                _context.Database.CloseConnection();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro na conexão: {ex.Message}");
                return false;
            }
        }
    }
}