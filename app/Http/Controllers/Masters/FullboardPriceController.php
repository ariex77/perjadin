<?php

namespace App\Http\Controllers\Masters;

use App\Http\Controllers\Controller;
use App\Http\Requests\Masters\FullboardPriceRequest;
use App\Http\Resources\Masters\FullboardPriceResource;
use App\Models\FullboardPrice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FullboardPriceController extends Controller
{
    public function index(Request $request)
    {
        $fullboardPrice = FullboardPrice::query()
            ->select('id', 'province_name', 'price', 'created_at')
            ->when($request->filled('search'), function ($query) use ($request) {
                $query->where('province_name', 'like', '%' . $request->search . '%');
            })
            ->orderBy('province_name')
            ->paginate(10);

        return inertia('masters/fullboard-prices/index', [
            'FullboardPrices' => FullboardPriceResource::collection($fullboardPrice)->response()->getData(true),
            'search' => $request->get('search', ''),
        ]);
    }

    public function create()
    {
        return inertia('masters/fullboard-prices/create');
    }

    public function store(FullboardPriceRequest $request)
    {
        try {
            FullboardPrice::create([
                'province_name' => $request->province_name,
                'price' => $request->price,
            ]);

            return redirect()->route('masters.fullboard-prices.index')->with('success', 'Harga fullboard berhasil ditambahkan.');
        } catch (\Exception $e) {
            if ($e instanceof \Illuminate\Database\QueryException && $e->getCode() == 23000) {
                // Error kode 23000 = Integrity constraint violation (duplicate entry)
                return redirect()->route('masters.fullboard-prices.index')->with('error', 'Nama harga fullboard sudah digunakan.');
            }
            return redirect()->route('masters.fullboard-prices.index')->with('error', 'Terjadi kesalahan saat menambah harga fullboard.');
        }
    }

    public function edit(FullboardPrice $fullboardPrice)
    {
        return inertia('masters/fullboard-prices/edit', compact('fullboardPrice'));
    }

    public function update(FullboardPriceRequest $request, FullboardPrice $fullboardPrice)
    {
        try {
            $fullboardPrice->update([
                'province_name' => $request->province_name ?? $fullboardPrice->province_name,
                'price' => $request->price ?? $fullboardPrice->price,
            ]);

            return redirect()->route('masters.fullboard-prices.index')->with('success', 'Harga fullboard berhasil diperbarui.');
        } catch (\Exception $e) {
            return redirect()->route('masters.fullboard-prices.index')->with('error', $e->getMessage() ?: 'Terjadi kesalahan saat memperbarui harga fullboard.');
        }
    }

    public function destroy(FullboardPrice $fullboardPrice)
    {
        try {
            // if ($fullboardPrice->subjects()->exists()) {
            //     return redirect()->back()->with('error', 'Tidak dapat menghapus harga fullboard yang masih memiliki data mata pelajaran.');
            // }

            $fullboardPrice->delete();
            return redirect()->back()->with('success', 'Harga fullboard berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menghapus harga fullboard.');
        }
    }

    public function bulkDelete(Request $request)
    {

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:fullboard_prices,id',
        ]);

        // $categoriesWithCourses = FullboardPrice::whereIn('id', $request->ids)
        //     ->has('subjects')
        //     ->pluck('province_name');

        // if ($categoriesWithCourses->isNotEmpty()) {
        //     return redirect()->back()->with(
        //         'error',
        //         'Tidak dapat menghapus Harga fullboard yang masih memiliki data mata pelajaran.'
        //     );
        // }

        DB::transaction(function () use ($request) {
            FullboardPrice::whereIn('id', $request->ids)->get();
            FullboardPrice::whereIn('id', $request->ids)->delete();
        });

        return redirect()->back()->with('success', 'Harga fullboard berhasil dihapus.');
    }
}