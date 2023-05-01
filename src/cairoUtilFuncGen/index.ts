// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { AST } from '../ast/ast.ts';
import { MemoryArrayLiteralGen } from './memory/arrayLiteral.ts';
import { MemoryDynArrayLengthGen } from './memory/memoryDynArrayLength.ts';
import { MemoryMemberAccessGen } from './memory/memoryMemberAccess.ts';
import { MemoryReadGen } from './memory/memoryRead.ts';
import { MemoryStructGen } from './memory/memoryStruct.ts';
import { MemoryWriteGen } from './memory/memoryWrite.ts';
import { MemoryStaticArrayIndexAccessGen } from './memory/staticIndexAccess.ts';
import { DynArrayGen } from './storage/dynArray.ts';
import { DynArrayIndexAccessGen } from './storage/dynArrayIndexAccess.ts';
import { DynArrayPopGen } from './storage/dynArrayPop.ts';
import { DynArrayPushWithArgGen } from './storage/dynArrayPushWithArg.ts';
import { DynArrayPushWithoutArgGen } from './storage/dynArrayPushWithoutArg.ts';
import { CallDataToMemoryGen } from './calldata/calldataToMemory.ts';
import { ExternalDynArrayStructConstructor } from './calldata/externalDynArray/externalDynArrayStructConstructor.ts';
import { ImplicitArrayConversion } from './calldata/implicitArrayConversion.ts';
import { MappingIndexAccessGen } from './storage/mappingIndexAccess.ts';
import { StorageStaticArrayIndexAccessGen } from './storage/staticArrayIndexAccess.ts';
import { StorageDeleteGen } from './storage/storageDelete.ts';
import { StorageMemberAccessGen } from './storage/storageMemberAccess.ts';
import { StorageReadGen } from './storage/storageRead.ts';
import { StorageToMemoryGen } from './storage/storageToMemory.ts';
import { StorageWriteGen } from './storage/storageWrite.ts';
import { MemoryToCallDataGen } from './memory/memoryToCalldata.ts';
import { MemoryToStorageGen } from './memory/memoryToStorage.ts';
import { CalldataToStorageGen } from './calldata/calldataToStorage.ts';
import { StorageToStorageGen } from './storage/copyToStorage.ts';
import { StorageToCalldataGen } from './storage/storageToCalldata.ts';
;
import { MemoryImplicitConversionGen } from './memory/implicitConversion.ts';
import { MemoryArrayConcat } from './memory/arrayConcat.ts';
import { EnumInputCheck } from './enumInputCheck.ts';
import { EncodeAsFelt } from './utils/encodeToFelt.ts';
import { AbiEncode } from './abi/abiEncode.ts';
import { AbiEncodePacked } from './abi/abiEncodePacked.ts';
import { AbiEncodeWithSelector } from './abi/abiEncodeWithSelector.ts';
import { AbiEncodeWithSignature } from './abi/abiEncodeWithSignature.ts';
import { AbiDecode } from './abi/abiDecode.ts';
import { IndexEncode } from './abi/indexEncode.ts';
import { EventFunction } from './event.ts';

export class CairoUtilFuncGen {
  abi: {
    decode: AbiDecode;
    encode: AbiEncode;
    encodePacked: AbiEncodePacked;
    encodeWithSelector: AbiEncodeWithSelector;
    encodeWithSignature: AbiEncodeWithSignature;
  };
  calldata: {
    dynArrayStructConstructor: ExternalDynArrayStructConstructor;
    toMemory: CallDataToMemoryGen;
    toStorage: CalldataToStorageGen;
    convert: ImplicitArrayConversion;
  };
  memory: {
    arrayLiteral: MemoryArrayLiteralGen;
    concat: MemoryArrayConcat;
    convert: MemoryImplicitConversionGen;
    dynArrayLength: MemoryDynArrayLengthGen;
    memberAccess: MemoryMemberAccessGen;
    read: MemoryReadGen;
    staticArrayIndexAccess: MemoryStaticArrayIndexAccessGen;
    struct: MemoryStructGen;
    toCallData: MemoryToCallDataGen;
    toStorage: MemoryToStorageGen;
    write: MemoryWriteGen;
  };
  storage: {
    delete: StorageDeleteGen;
    dynArray: DynArrayGen;
    dynArrayIndexAccess: DynArrayIndexAccessGen;
    dynArrayPop: DynArrayPopGen;
    dynArrayPush: {
      withArg: DynArrayPushWithArgGen;
      withoutArg: DynArrayPushWithoutArgGen;
    };
    mappingIndexAccess: MappingIndexAccessGen;
    memberAccess: StorageMemberAccessGen;
    read: StorageReadGen;
    staticArrayIndexAccess: StorageStaticArrayIndexAccessGen;
    toCallData: StorageToCalldataGen;
    toMemory: StorageToMemoryGen;
    toStorage: StorageToStorageGen;
    write: StorageWriteGen;
  };
  events: {
    index: IndexEncode;
    event: EventFunction;
  };
  utils: {
    encodeAsFelt: EncodeAsFelt;
  };

  constructor(ast: AST, sourceUnit: SourceUnit) {
    const dynArray = new DynArrayGen(ast, sourceUnit);
    const memoryRead = new MemoryReadGen(ast, sourceUnit);
    const storageReadGen = new StorageReadGen(ast, sourceUnit);
    const storageDelete = new StorageDeleteGen(dynArray, storageReadGen, ast, sourceUnit);
    const memoryToStorage = new MemoryToStorageGen(
      dynArray,
      memoryRead,
      storageDelete,
      ast,
      sourceUnit,
    );
    const storageWrite = new StorageWriteGen(ast, sourceUnit);
    const storageToStorage = new StorageToStorageGen(dynArray, storageDelete, ast, sourceUnit);
    const calldataToStorage = new CalldataToStorageGen(dynArray, storageWrite, ast, sourceUnit);
    const externalDynArrayStructConstructor = new ExternalDynArrayStructConstructor(
      ast,
      sourceUnit,
    );

    const memoryWrite = new MemoryWriteGen(ast, sourceUnit);
    const storageDynArrayIndexAccess = new DynArrayIndexAccessGen(dynArray, ast, sourceUnit);
    const callDataConvert = new ImplicitArrayConversion(
      storageWrite,
      dynArray,
      storageDynArrayIndexAccess,
      ast,
      sourceUnit,
    );
    this.memory = {
      arrayLiteral: new MemoryArrayLiteralGen(ast, sourceUnit),
      concat: new MemoryArrayConcat(ast, sourceUnit),
      convert: new MemoryImplicitConversionGen(memoryWrite, memoryRead, ast, sourceUnit),
      dynArrayLength: new MemoryDynArrayLengthGen(ast, sourceUnit),
      memberAccess: new MemoryMemberAccessGen(ast, sourceUnit),
      read: memoryRead,
      staticArrayIndexAccess: new MemoryStaticArrayIndexAccessGen(ast, sourceUnit),
      struct: new MemoryStructGen(ast, sourceUnit),
      toCallData: new MemoryToCallDataGen(
        externalDynArrayStructConstructor,
        memoryRead,
        ast,
        sourceUnit,
      ),
      toStorage: memoryToStorage,
      write: memoryWrite,
    };
    this.storage = {
      delete: storageDelete,
      dynArray: dynArray,
      dynArrayIndexAccess: storageDynArrayIndexAccess,
      dynArrayPop: new DynArrayPopGen(dynArray, storageDelete, ast, sourceUnit),
      dynArrayPush: {
        withArg: new DynArrayPushWithArgGen(
          dynArray,
          storageWrite,
          memoryToStorage,
          storageToStorage,
          calldataToStorage,
          callDataConvert,
          ast,
          sourceUnit,
        ),
        withoutArg: new DynArrayPushWithoutArgGen(dynArray, ast, sourceUnit),
      },
      mappingIndexAccess: new MappingIndexAccessGen(dynArray, ast, sourceUnit),
      memberAccess: new StorageMemberAccessGen(ast, sourceUnit),
      read: storageReadGen,
      staticArrayIndexAccess: new StorageStaticArrayIndexAccessGen(ast, sourceUnit),
      toCallData: new StorageToCalldataGen(
        dynArray,
        storageReadGen,
        externalDynArrayStructConstructor,
        ast,
        sourceUnit,
      ),
      toMemory: new StorageToMemoryGen(dynArray, ast, sourceUnit),
      toStorage: storageToStorage,
      write: storageWrite,
    };
    this.calldata = {
      dynArrayStructConstructor: externalDynArrayStructConstructor,
      toMemory: new CallDataToMemoryGen(ast, sourceUnit),
      convert: callDataConvert,
      toStorage: calldataToStorage,
    };

    const abiEncode = new AbiEncode(memoryRead, ast, sourceUnit);
    this.abi = {
      decode: new AbiDecode(memoryWrite, ast, sourceUnit),
      encode: abiEncode,
      encodePacked: new AbiEncodePacked(memoryRead, ast, sourceUnit),
      encodeWithSelector: new AbiEncodeWithSelector(abiEncode, ast, sourceUnit),
      encodeWithSignature: new AbiEncodeWithSignature(abiEncode, ast, sourceUnit),
    };
    const indexEncode = new IndexEncode(memoryRead, ast, sourceUnit);
    this.events = {
      index: indexEncode,
      event: new EventFunction(abiEncode, indexEncode, ast, sourceUnit),
    };
    this.utils = {
      encodeAsFelt: new EncodeAsFelt(externalDynArrayStructConstructor, ast, sourceUnit),
    };
  }
}
