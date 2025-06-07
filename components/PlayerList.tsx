'use client';

type Player = {
  id: string;
  name: string;
};

type PlayerListProps = {
  players: Player[];
  currentTurn: string;
};

export default function PlayerList({ players, currentTurn }:PlayerListProps) {
  return (
    <ul className="space-y-2">
      {players.map((player) => (
        <li
          key={player.id}
          className={`p-2 rounded ${
            player.id === currentTurn ? 'bg-green-200' : 'bg-gray-100'
          }`}
        >
          {player.name}
        </li>
      ))}
    </ul>
  );
}
