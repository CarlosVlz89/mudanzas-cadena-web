import { MapPin, Truck, MessageCircle, Printer, CreditCard, Edit3, ClipboardList, Trash2, CheckCircle } from 'lucide-react';

const MoveCard = ({ move, onEdit, onDelete, onCopyLink, onViewId, onPrintOrder, isPending }) => {
  const hasItems = Array.isArray(move.items) && move.items.length > 0;
  
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between gap-6 hover:shadow-lg transition-all duration-300 ${isPending ? 'border-l-[6px] border-l-cadena-pink border-t border-r border-b border-gray-100' : 'border border-gray-100'}`}>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-xs font-bold font-mono tracking-wider">{move.folio}</span>
          <h3 className="font-bold text-xl text-gray-800">{move.client}</h3>
          {move.phone && <a href={`https://wa.me/${move.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="text-green-500 bg-green-50 p-1.5 rounded-full hover:bg-green-100 transition"><MessageCircle size={18} /></a>}
        </div>
        <div className="text-sm text-gray-500 space-y-2 mb-4">
          <div className="flex items-center gap-2.5"><MapPin size={16} className="text-cadena-pink"/> <span className="font-medium truncate max-w-xs">{move.origin}</span></div>
          <div className="flex items-center gap-2.5"><Truck size={16} className="text-gray-400"/> {hasItems ? `${move.items.length} Artículos registrados` : 'Sin lista de inventario'}</div>
        </div>
        <div className="flex gap-2">
            {move.idUrl && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">INE OK</span>}
            {move.addressUrl && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">DOM OK</span>}
        </div>
      </div>
      <div className="flex flex-col items-end justify-between min-w-[140px] border-l border-gray-50 pl-6 md:border-l-0 md:pl-0">
        <div className="text-right">
          {move.price > 0 ? <p className="text-2xl font-black text-cadena-dark">${move.price.toLocaleString()}</p> : <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold uppercase tracking-wide">Por Cotizar</span>}
          <div className={`mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-white ${move.status === 'Contrato Firmado' ? 'bg-purple-500' : 'bg-cadena-blue'}`}>{move.status}</div>
        </div>
        <div className="flex gap-2 mt-4">
          {onPrintOrder && <button onClick={onPrintOrder} className="p-2.5 text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition"><Printer size={20}/></button>}
          <button onClick={onViewId} className="p-2.5 text-green-600 bg-green-50 rounded-xl hover:bg-green-100 transition"><CreditCard size={20}/></button>
          <button onClick={onEdit} className="p-2.5 text-white bg-cadena-blue rounded-xl shadow-md hover:bg-blue-700 transition hover:-translate-y-0.5"><Edit3 size={20}/></button>
          {onCopyLink && <button onClick={onCopyLink} className="p-2.5 text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition"><ClipboardList size={20}/></button>}
          <button onClick={onDelete} className="p-2.5 text-red-400 bg-red-50 rounded-xl hover:bg-red-100 transition"><Trash2 size={20}/></button>
        </div>
      </div>
    </div>
  );
};

export default MoveCard;