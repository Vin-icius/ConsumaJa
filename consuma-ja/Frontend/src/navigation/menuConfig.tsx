import React from 'react';
import { Ionicons } from '@expo/vector-icons';

type IconRender = (props: { color: string; size: number }) => React.ReactNode;

export type UserRole = 'Admin' | 'Fornecedor' | 'Cliente';

export interface MenuItem {
  key: string;
  name: string;
  component: React.ComponentType<any>;
  title: string;
  icon: IconRender;
  roles: UserRole[];
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
  isDropdown?: boolean;
  roles: UserRole[];
}

// OBS: Os componentes reais são atribuídos dinamicamente no appNavigator, por isso usamos stubs aqui.
export const createMenuSections = (screens: Record<string, MenuItem>): MenuSection[] => [
  {
    title: 'Geral',
    roles: ['Admin', 'Fornecedor', 'Cliente'],
    items: [screens['Inicio']].filter(Boolean) as MenuItem[],
  },
  {
    title: 'Fornecedor',
    isDropdown: true,
    roles: ['Admin', 'Fornecedor'],
    items: [
      screens['Cadastro Produto'],
      screens['PromocaoList'],
      screens['LoteList'],
    ].filter(Boolean) as MenuItem[],
  },
  {
    title: 'Admin',
    isDropdown: true,
    roles: ['Admin'],
    items: [
      screens['Cadastro Categoria'],
      screens['Cadastro Marca'],
      screens['Cadastro Tipo'],
      screens['Aprovacao de Produtos'],
      screens['EstadoList'],
      screens['CidadeList'],
      screens['PessoaList'],
    ].filter(Boolean) as MenuItem[],
  },
  {
    title: 'Sistema',
    roles: ['Admin', 'Fornecedor', 'Cliente'],
    items: [
      screens['Relatorios'],
      screens['Configuracoes'],
    ].filter(Boolean) as MenuItem[],
  },
];

export const baseIconMap: Record<string, IconRender> = {
  Inicio: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
  'Cadastro Produto': ({ color, size }) => <Ionicons name="cube-outline" color={color} size={size} />,
  PromocaoList: ({ color, size }) => <Ionicons name="megaphone-outline" color={color} size={size} />,
  LoteList: ({ color, size }) => <Ionicons name="layers-outline" color={color} size={size} />,
  LoteForm: ({ color, size }) => <Ionicons name="construct-outline" color={color} size={size} />,
  'Cadastro Categoria': ({ color, size }) => <Ionicons name="pricetag-outline" color={color} size={size} />,
  'Cadastro Marca': ({ color, size }) => <Ionicons name="bookmark-outline" color={color} size={size} />,
  'Cadastro Tipo': ({ color, size }) => <Ionicons name="file-tray-outline" color={color} size={size} />,
  'Aprovacao de Produtos': ({ color, size }) => <Ionicons name="checkmark-done-outline" color={color} size={size} />,
  EstadoList: ({ color, size }) => <Ionicons name="map-outline" color={color} size={size} />,
  CidadeList: ({ color, size }) => <Ionicons name="business-outline" color={color} size={size} />,
  PessoaList: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
  Relatorios: ({ color, size }) => <Ionicons name="stats-chart-outline" color={color} size={size} />,
  Configuracoes: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />,
  Sair: ({ color, size }) => <Ionicons name="log-out-outline" color={color} size={size} />,
};
